import fs from 'fs'
import os from 'os'
import path from 'path'
import { lastInArray } from '../helpers'
import { IStore } from './'
import { logInfoLevel } from '../queue'

export interface IFileStoreOptions<T> {
  id: string
  stringify?: (event: T) => string
  parse?: (event: string) => T
  logger?: (log: string, lvl?: logInfoLevel) => void
}

// this fixes the issue with JSON.stringify not working with Sets
class SSet<T> extends Set<T> {
  toJSON() {
    return Array.from(this)
  }
}

const fileStoresInstances: Record<string, FileStore<unknown>> = {}

export class FileStore<T> implements IStore<T> {
  private retries: Record<string, number> = {}
  private taken = new SSet<string>()
  private path: string = ''
  private stringify: (event: T) => string = JSON.stringify
  private parse: (event: string) => T = JSON.parse
  private queuedOrd: string[] = []
  private logger: (log: string, lvl?: logInfoLevel) => void
  constructor({ id, stringify, parse, logger }: IFileStoreOptions<T>) {
    this.logger =
      logger ??
      (() => {
        // intentionally empty
      })
    if (fileStoresInstances[id] !== undefined) {
      return fileStoresInstances[id] as FileStore<T>
    } else {
      fileStoresInstances[id] = this as FileStore<unknown>
    }
    this.path = path.join(os.tmpdir(), `queue-${id}`)
    this.logger(`Initializing file store with path: ${this.path}`, 'debug')
    this.stringify = stringify || this.stringify
    this.parse = parse || this.parse
    fs.mkdirSync(`${this.path}/events`, { recursive: true })
    if (!fs.existsSync(`${this.path}/index`))
      fs.writeFileSync(`${this.path}/index`, '[]', 'utf-8')
    const queuedOrd = JSON.parse(fs.readFileSync(`${this.path}/index`, 'utf-8'))
    if (!fs.existsSync(`${this.path}/retries`))
      fs.writeFileSync(`${this.path}/retries`, '{}', 'utf-8')
    const retries = JSON.parse(fs.readFileSync(`${this.path}/retries`, 'utf-8'))
    // NOTE: reset taken on class init if it exsits
    if (fs.existsSync(`${this.path}/taken`))
      fs.writeFileSync(`${this.path}/taken`, '[]', 'utf-8')
    if (
      !Array.isArray(queuedOrd) ||
      !queuedOrd.every((v) => typeof v === 'string')
    ) {
      throw new Error(`Invalid queue index at ${this.path}/index`)
    }
    this.queuedOrd = queuedOrd as string[]
    this.retries = retries as Record<string, number>
  }
  public cleanup = () => {
    fs.rmSync(this.path, { recursive: true, force: true })
    this.retries = {}
    this.taken = new SSet<string>()
    this.queuedOrd = []
    return
  }
  private addTask: (
    id: string,
    task: T,
    begginning?: boolean
  ) => Promise<boolean> = (id, task, beginning = false) => {
    this.logger(
      `Adding new task: ${JSON.stringify({ id, task, beginning })}`,
      'debug'
    )
    const stringifiedTask = this.stringify(task)
    this.logger(`Stringified task: ${stringifiedTask}`, 'debug')
    if (beginning) {
      this.logger(`Unshifting with id: ${id}`, 'debug')
      this.queuedOrd.unshift(id)
    } else {
      this.logger(`Pushing with id: ${id}`, 'debug')
      this.queuedOrd.push(id)
    }
    this.logger(`queueOrd: ${JSON.stringify(this.queuedOrd)}`, 'debug')
    return new Promise(async (res, rej) => {
      fs.writeFile(
        `${this.path}/events/${id}`,
        stringifiedTask,
        { encoding: 'utf-8' },
        async (err) => {
          if (err) {
            this.logger(`Error: ${err}`, 'error')
            this.logger(
              `The file was not saved! remove id: ${id} from queueOrd`,
              'error'
            )
            this.queuedOrd = this.queuedOrd.filter((v) => v !== id)
            rej(err)
          }
          res(true)
        }
      )
    })
  }
  public size = () => {
    this.logger(`Getting size...`, 'debug')
    return new Promise<number>((res, rej) => {
      fs.readdir(`${this.path}/events/`, (err, files) => {
        if (err) return rej(err)
        this.logger(`Size: ${files.length}`, 'debug')
        res(files.length)
      })
    })
  }
  public check = async () => {
    this.logger(`Checking Store Validity...`, 'debug')
    return new Promise<boolean>((res, rej) => {
      fs.readdir(`${this.path}/events/`, (err, files) => {
        if (err) return rej(err)
        this.logger(`Actual Files: ${JSON.stringify(files.length)}`, 'debug')
        this.logger(
          `Queued Order Length: ${JSON.stringify(this.queuedOrd.length)}`,
          'debug'
        )
        if (this.queuedOrd.length !== files.length) {
          this.logger(`Queued Order Length !== Actual Files`, 'debug')
          return res(false)
        }
        this.logger(`Check that ids in queuedOrd match actual files`, 'debug')
        if (
          JSON.stringify(this.queuedOrd.sort()) !== JSON.stringify(files.sort())
        ) {
          this.logger(`Queued Order !== Actual Files`, 'debug')
          this.logger(
            `Queued Order: ${JSON.stringify(
              [...this.queuedOrd].sort()
            )} (resorted)`,
            'debug'
          )
          this.logger(`Actual Files: ${JSON.stringify(files.sort())}`, 'debug')
          return res(false)
        }
      })
    })
  }
  public clear = () => {
    return new Promise<boolean>((res, rej) => {
      fs.rm(`${this.path}`, { recursive: true, force: true }, async (err) => {
        if (err) return rej(err)
        fs.mkdir(`${this.path}/events`, { recursive: true }, (err) => {
          if (err) return rej(err)
          this.queuedOrd = []
          this.retries = {}
          this.taken = new SSet<string>()
          res(true)
        })
      })
    })
  }
  private writeIndex = () => {
    this.logger(`Writing Index File...`, 'debug')
    const stringifiedOrd = JSON.stringify(this.queuedOrd)
    this.logger(`Stringified Ord: ${stringifiedOrd}`, 'debug')
    return new Promise((res, rej) => {
      fs.writeFile(`${this.path}/index`, stringifiedOrd, 'utf-8', (err) => {
        if (err) {
          this.logger(`Error writing index file: ${err}`, 'error')
          return rej(err)
        }
        this.logger(`Wrote index file`, 'debug')
        res(true)
      })
    })
  }
  private writeTaken = () => {
    this.logger(`Writing Taken File...`, 'debug')
    const stringifiedTaken = JSON.stringify(this.taken)
    this.logger(`Stringified Taken: ${stringifiedTaken}`, 'debug')
    return new Promise<boolean>((res, rej) => {
      fs.writeFile(`${this.path}/taken`, stringifiedTaken, 'utf-8', (err) => {
        if (err) {
          this.logger(`Error writing taken file: ${err}`, 'error')
          return rej(err)
        }
        this.logger(`Wrote taken file`, 'debug')
        res(true)
      })
    })
  }
  private writeRetries = () => {
    this.logger(`Writing Retries File...`, 'debug')
    const stringifiedRetries = JSON.stringify(this.taken)
    this.logger(`Stringified Retries: ${stringifiedRetries}`, 'debug')
    return new Promise<boolean>((res, rej) => {
      fs.writeFile(
        `${this.path}/retries`,
        stringifiedRetries,
        'utf-8',
        (err) => {
          if (err) {
            this.logger(`Error writing retries file: ${err}`, 'error')
            return rej(err)
          }
          this.logger(`Wrote retries file`, 'debug')
          res(true)
        }
      )
    })
  }
  public rotate = (): Promise<boolean> => {
    this.logger(`Rotating...`, 'debug')
    return new Promise((res, rej) => {
      this.logger(`Moving the first item in the queue to the end...`, 'debug')
      const id = this.queuedOrd.shift()
      this.logger(`Popped off id: ${id}`, 'debug')
      if (!id) {
        this.logger(`No tasks in queue`, 'debug')
        return rej('No tasks in queue')
      }
      this.logger(`Pushing id: ${id} to the end`, 'debug')
      this.queuedOrd.push(id)
      this.writeIndex().then(() => res(true))
    })
  }
  public remove = async (id: string): Promise<boolean> => {
    await this.release(id)
    return new Promise((res, rej) => {
      fs.rm(`${this.path}/events/${id}`, (err) => {
        if (err) return rej(err)
        this.queuedOrd = this.queuedOrd.filter((i) => i !== id)
        this.writeIndex().then(() => res(true))
      })
    })
  }
  public push: IStore<T>['push'] = (id, task) => {
    return this.addTask(id, task)
  }
  public unshift: IStore<T>['push'] = (id, task) => {
    return this.addTask(id, task, true)
  }
  public next = (): Promise<string | undefined> => {
    return new Promise<string | undefined>((res, rej) => {
      // if (!this.check()) {
      //   rej('Queue is unbalanced!')
      // }
      if (
        !this.queuedOrd.some((id) => {
          if (!this.taken.has(id)) {
            res(id)
            return true
          }
          return false
        })
      )
        return res(undefined)
    })
  }
  public last = (): Promise<string> => {
    return new Promise((res, rej) => {
      // if (!this.check()) {
      //   rej(`Queue is unbalanced!`)
      // }
      if (this.queuedOrd.length > 0) {
        const last = lastInArray(this.queuedOrd)
        if (last === undefined) {
          return rej('No tasks in queue')
        }
        res(last)
      }
      return rej('No tasks in queue')
    })
  }
  public take: IStore<T>['take'] = (id) => {
    return new Promise(async (res, rej) => {
      if (!this.queuedOrd.includes(id)) {
        rej('Task not found')
      }
      if (this.taken.has(id)) {
        // task is already taken
        return res(false)
      }
      this.taken.add(id)
      res(this.writeTaken())
    })
  }
  public release: IStore<T>['release'] = (id) => {
    return new Promise<boolean>(async (res, rej) => {
      if (!this.queuedOrd.includes(id)) {
        rej('Task not found')
      }
      if (!this.taken.has(id)) {
        rej(`Taken: ${JSON.stringify(this.taken)}, id: ${id}`)
      }
      this.taken.delete(id)
      return this.writeTaken()
        .then((comp) => {
          res(comp)
        })
        .catch((_error) => {
          // if the write fails, then add the task back to the taken as the release failed
          this.taken.add(id)
          res(false)
        })
    }).catch((e: string) => {
      this.logger(e, 'error')
      return false
    })
  }
  public releaseAll: IStore<T>['releaseAll'] = () => {
    return new Promise(async (res) => {
      const _taken = new SSet(this.taken)
      this.taken.clear()
      return this.writeTaken()
        .then((comp) => {
          res(comp)
        })
        .catch((_error) => {
          // if the write fails, then reset taken as the release failed
          this.taken = _taken
          res(false)
        })
    })
  }
  public get: IStore<T>['get'] = (id) => {
    return new Promise<T>(async (res, rej) => {
      fs.readFile(`${this.path}/events/${id}`, 'utf-8', (err, data) => {
        if (err) rej(err)
        if (!data) rej('No data found')
        const task = this.parse(data)
        if (task === undefined) {
          return rej('Task not found')
        }
        res(task)
      })
    })
  }
  public takeNext: IStore<T>['takeNext'] = async () => {
    this.logger(`Taking next task...`, 'debug')
    const id = await this.next()
    if (!id) {
      this.logger(`No next id found...`, 'debug')
      return undefined
    }
    const taken = await this.take(id)
    if (!taken) {
      this.logger(`Could not take id: ${id}`, 'debug')
      return undefined
    }
    const task = await this.get(id)
    this.logger(`Retrieved task: ${task}`, 'debug')
    return [id, task]
  }
  public retry: IStore<T>['retry'] = async (
    id: string,
    maxRetries?: number
  ) => {
    this.logger(`Retrying task: ${id}`, 'debug')
    if (this.retries?.[id] !== undefined) {
      this.retries[id]++
    } else {
      this.retries[id] = 1
    }
    this.logger(`Retries: ${this.retries[id]}`, 'debug')
    if (!(await this.writeRetries())) {
      throw new Error(`Could not write retries to file`)
    }
    if (maxRetries !== undefined && this.retries[id] > maxRetries) {
      this.logger(
        `Max retries (${maxRetries}) reached for task: ${id}. Removing...`,
        'debug'
      )
      return this.remove(id).then((comp) => {
        if (comp) {
          this.logger(`Removed task: ${id}`, 'debug')
          return false
        }
        throw new Error(
          `Could not remove task ${id} from queue after max retries`
        )
      })
    }
    return this.release(id)
  }
}
