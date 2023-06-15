import { IQueue, IQueueOptions, Queue } from './queue'

export const queues: Record<string, Queue<unknown>> = {}

export const queue = <T>(
  id: string,
  process: IQueue<T>['process'],
  options: IQueueOptions<T> = {}
) => {
  if (queues?.[id] !== undefined) {
    return queues[id] as Queue<T>
  }
  const q = new Queue<T>(id, process, options)
  queues[id] = q as Queue<unknown>
  return q
}

export * from './stores'
export * from './helpers'
export * from './queue'
export * from './worker'

export default queue
