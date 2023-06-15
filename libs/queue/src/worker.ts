import { randomUUID } from 'node:crypto'
import { Queue, logInfoLevel } from './queue'
import { IStore } from './stores'
import { eventful, timedOut } from './helpers'
import handelse, { IEventHandler } from '@gofer-engine/handelse'

interface IWorker {
  status: () =>
    | 'initializing' // use this only when first initialized before starting the first task
    | 'stopped' // use this when the worker was manually stopped
    // TODO: no use yet of 'error' status
    // | 'error' // use this if the worker cannot continue because of an error
    // NOTE: the following are good states, and would not need a restart
    | 'idle' // use this when the worker was not manually stopped, but ran out of tasks to process
    | 'sleeping' // use this to sleep between processing
    | 'running' // use this if running normally
  start: () => void
  stop: () => void
  lastStarted: () => Date | undefined
  lastCompleted: () => Date | undefined
  processed: () => number
  processing: () => string | undefined
}

export type TStatus = ReturnType<IWorker['status']>

export interface IWorkerEvents<T> {
  onStatusChange: IEventHandler<[TStatus, TStatus]>
  onProcessStart: IEventHandler<[id: string, task?: T]>
  // use this if task failed even if it is requeued to try again
  onFail: IEventHandler<[id: string, task?: T]>
  // use this if the task succeeds
  onComplete: IEventHandler<[id: string, task: T]>
  // use this if not requeed after error
  onError: IEventHandler<[id: string, task?: T]>
}

export class Worker<T> implements IWorker {
  private store: IStore<T>
  public readonly id: string
  private mainLoop: NodeJS.Timeout | undefined
  private queue: Queue<T>
  private _status: TStatus = 'initializing'
  public status = () => this._status
  private _lastStarted: ReturnType<IWorker['lastStarted']>
  public lastStarted = () => this._lastStarted
  private _lastCompleted: ReturnType<IWorker['lastCompleted']>
  public lastCompleted = () => this._lastCompleted
  private _processed: ReturnType<IWorker['processed']>
  public processed = () => this._processed
  private _processing: ReturnType<IWorker['processing']>
  public processing = () => this._processing
  private logger = (message: string, lvl?: logInfoLevel) =>
    this.queue.logger(`(worker:${this.id}) ${message}`, lvl)
  public events: IWorkerEvents<T> = {
    onStatusChange: handelse.instance<[prev: TStatus, new: TStatus]>(),
    onProcessStart: handelse.instance<[id: string, task?: T]>(),
    onFail: handelse.instance<[id: string, task?: T]>(),
    onComplete: handelse.instance<[id: string, task: T]>(),
    onError: handelse.instance<[id: string, task?: T]>(),
  } as const
  public on = <K extends keyof IWorkerEvents<T>>(
    key: K,
    listener: Parameters<IWorkerEvents<T>[K]['listen']>[0]
  ) => {
    // @ts-expect-error the type of listener is guarenteed to be correct, but the use of it in the next line does not know that.
    this.events[key].listen(listener)
  }
  private setStatus = (v: TStatus | ((prev: TStatus) => TStatus)) =>
    (this._status = eventful(v, this._status, this.events.onStatusChange))
  constructor(queue: Queue<T>, store: IStore<T>) {
    this.id = randomUUID()
    this.queue = queue
    this.store = store
    this._processed = 0
    if (queue.options.verbose) {
      this.events.onStatusChange.sub(([prev, next]) => {
        this.logger(`onStatusChange: ${prev} -> ${next}`, 'info')
        return true
      })
      this.events.onProcessStart.sub(([id, task]) => {
        this.logger(`onProcessStart: ${JSON.stringify({ id, task })}`, 'info')
        return true
      })
      this.events.onComplete.sub(([id, task]) => {
        this.logger(`onComplete: ${JSON.stringify({ id, task })}`, 'info')
        return true
      })
      this.events.onFail.sub(([id, task]) => {
        this.logger(`onFail: ${JSON.stringify({ id, task })}`, 'warn')
        return true
      })
      this.events.onError.sub(([id, task]) => {
        this.logger(`onError: ${JSON.stringify({ id, task })}`, 'error')
        return true
      })
    }
    this.start()
  }
  private idle: () => void = async () => {
    if (!this.mainLoop) {
      this.logger('Worker already stopped/idle', 'info')
      return
    }
    const temp = this.mainLoop
    clearInterval(this.mainLoop)
    this.mainLoop = undefined
    this.logger(`Idle this.mainLoop: ${temp}`, 'debug')
    this.setStatus('idle')
    return
  }
  private main = async () => {
    const log = this.logger
    if (this._processing) {
      log('Still processing', 'debug')
      // still processing, stop this cycle
      return
    }
    const next = (await this.store.takeNext()) ?? []
    const [id] = next
    let [, task] = next
    log(`Next id: ${id}`, 'debug')
    log(`Next task: ${JSON.stringify(task)}`, 'debug')
    if (!id) {
      log('No Next ID, go to idle', 'debug')
      return this.idle()
    }
    if (this._processing) {
      // another loop already took a task before this one finished, release
      // this should not happen, but just in case
      // throw a console error to watch for this during development
      log(
        `Another loop already took a task before this one was retrieved!`,
        'error'
      )
      this.store.release(id)
    }
    this._processing = id
    if (task === undefined && !this.queue.options.allowUndefined) {
      log(`Task is undefined, but undefined is not allowed`, 'error')
      await this.store.remove(id)
      await this.events.onFail.pub([id, task])
      this._processing = undefined
      return
    } else if (task === undefined) {
      log('Task is undefined, and undefined is allowed', 'debug')
      task = task as T
    }
    const now = new Date()
    await this.events.onProcessStart.pub([id, task])
    log(`About to start processing id: ${id}`, 'debug')
    const processed = await this.queue.process(task, () =>
      timedOut(now, this.queue.options.max_timeout)
    )
    log(`Processed id: ${id} with status: ${processed}`, 'debug')
    if (processed) {
      log(`Removing task id: ${id}`, 'debug')
      await this.store.remove(id)
      await this.events.onComplete.pub([id, task])
      this._processing = undefined
    } else {
      log(`Failing task id: ${id}`, 'debug')
      await this.events.onFail.pub([id, task])
      const requeued = await this.store.retry(
        id,
        this.queue.options.max_retries
      )
      log(`Tried to reque task id: ${id} with status: ${requeued}`, 'debug')
      if (!requeued) {
        this.events.onError.pub([id, task])
      }
      this._processing = undefined
    }
  }
  public start = () => {
    if (this.mainLoop) {
      // Worker already started, ignore
      return
    }
    this._lastStarted = new Date()
    this.mainLoop = setInterval(
      () => this.main(),
      this.queue.options.workerLoopInterval
    )
    this.logger(`Started this.mainLoop: ${this.mainLoop}`, 'info')
    this.setStatus('running')
  }
  public stop = () => {
    if (!this.mainLoop) {
      return
    }
    const temp = this.mainLoop
    clearInterval(this.mainLoop as NodeJS.Timeout)
    this.mainLoop = undefined
    this.logger(`Stopped this.mainLoop: ${temp}`, 'info')
    this.setStatus('stopped')
  }
}
