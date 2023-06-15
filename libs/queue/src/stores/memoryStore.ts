import handelse from '@gofer-engine/handelse'
import { lastInArray, promisify, shuffle } from '../helpers'
import { IStore, IStoreEvents, IStoreOptions, StoreDefaultOptions } from './'

export class MemoryStore<T> implements IStore<T> {
  private options: Required<IStoreOptions>
  private retries: Record<string, number> = {}
  private taken = new Set<string>()
  private store: Record<string, T> = {}
  private queuedIds = new Set<string>()
  private queuedOrd: string[] = []
  private events: IStoreEvents = {
    onDebug: handelse.instance(),
  }
  constructor(options: IStoreOptions = {}) {
    this.options = {
      ...StoreDefaultOptions,
      ...options,
    }
    if (this.options.verbose) {
      this.events.onDebug.sub((data) => {
        this.options.logger(`(store: memory) onDebug: ${JSON.stringify(data)}`)
        return true
      })
    }
  }
  private addTask: (
    id: string,
    task: T,
    begginning?: boolean
  ) => Promise<boolean> = (id, task, begginning = false) => {
    return new Promise((res) => {
      this.store[id] = task
      this.queuedIds.add(id)
      if (begginning) {
        this.queuedOrd.unshift(id)
      } else {
        this.queuedOrd.push(id)
      }
      res(this.check())
    })
  }
  public size = () => {
    return promisify(this.queuedIds.size)
  }
  public check = async () => {
    const size = await this.size()
    return promisify(
      size === this.queuedOrd.length && size === Object.keys(this.store).length
    )
  }
  public clear = () => {
    return new Promise<boolean>((res) => {
      this.store = {}
      this.queuedIds.clear()
      this.queuedOrd = []
      this.retries = {}
      res(this.check())
    })
  }
  public rotate: IStore<T>['rotate'] = (method): Promise<boolean> => {
    return new Promise((res, rej) => {
      switch (method) {
        case 'ftl': {
          // move the first item in the this.queuedOrd to the end
          const id = this.queuedOrd.shift()
          if (!id) {
            return rej('No tasks in queue')
          }
          this.queuedOrd.push(id)
          return res(this.check())
        }
        case 'ltf': {
          // move the last item in the this.queuedOrd to the beginning
          const id = this.queuedOrd.pop()
          if (!id) {
            return rej('No tasks in queue')
          }
          this.queuedOrd.unshift(id)
          return res(this.check())
        }
        case 'reverse': {
          this.queuedOrd.reverse()
          return res(this.check())
        }
        case 'shuffle': {
          this.queuedOrd = shuffle(this.queuedOrd)
          return res(this.check())
        }
        default:
          rej('Unknown rotation method')
      }
    })
  }
  public remove = async (id: string): Promise<boolean> => {
    await this.release(id)
    delete this.store[id]
    this.queuedIds.delete(id)
    this.queuedOrd = this.queuedOrd.filter((i) => i !== id)
    delete this.retries?.[id]
    return await this.check()
  }
  public push: IStore<T>['push'] = (id, data) => {
    return this.addTask(id, data)
  }
  public unshift: IStore<T>['unshift'] = (id, data) => {
    return this.addTask(id, data, true)
  }
  public next = async (): Promise<string | undefined> => {
    return new Promise<string | undefined>((res, rej) => {
      if (!this.check()) {
        rej('Queue is unbalanced!')
      }
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
  public cleanup = () => {
    this.retries = {}
    this.taken = new Set<string>()
    this.store = {}
    this.queuedIds = new Set<string>()
    this.queuedOrd = []
  }
  public last = (): Promise<string> => {
    return new Promise<string>((res, rej) => {
      if (!this.check()) {
        rej('Queue is unbalanced!')
      }
      if (this.queuedOrd.length > 0) {
        const last = lastInArray(this.queuedOrd)
        if (!last) {
          return rej('No tasks in queue')
        }
        res(last)
      }
      return rej('No tasks in queue')
    })
  }
  public take: IStore<T>['take'] = (id: string) => {
    return new Promise((res, rej) => {
      if (!this.queuedOrd.includes(id)) {
        rej('Task not found')
      }
      if (this.taken.has(id)) {
        // task is already taken
        return res(false)
      }
      this.taken.add(id)
      res(true)
    })
  }
  public release: IStore<T>['release'] = (id: string) => {
    return new Promise((res, rej) => {
      if (!this.queuedOrd.includes(id)) {
        rej('Task not found')
      }
      if (!this.taken.has(id)) {
        rej('Task not taken to release')
      }
      this.taken.delete(id)
      res(true)
    })
  }
  public releaseAll: IStore<T>['releaseAll'] = () => {
    return new Promise((res) => {
      this.taken.clear()
      res(true)
    })
  }
  public get: IStore<T>['get'] = (id: string): Promise<T> => {
    return new Promise<T>((res, rej) => {
      const task = this.store?.[id]
      if (task === undefined) {
        return rej('Task not found')
      }
      res(task)
    })
  }
  public takeNext: IStore<T>['takeNext'] = async () => {
    const id = await this.next()
    if (id && (await this.take(id))) {
      const task = await this.get(id)
      return [id, task]
    }
    return undefined
  }
  public retry: IStore<T>['retry'] = async (
    id: string,
    maxRetries?: number
  ) => {
    if (this.retries?.[id] !== undefined) {
      this.retries[id]++
    } else {
      this.retries[id] = 1
    }
    if (maxRetries !== undefined && this.retries[id] > maxRetries) {
      return this.remove(id).then((comp) => {
        if (comp) return false
        throw new Error(
          `Could not remove task ${id} from queue after max retries`
        )
      })
    }
    return this.release(id)
  }
}
