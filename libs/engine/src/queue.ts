import { IQueueOptions, queue as goferQueue } from '@gofer-engine/queue'
import { IMsg } from '@gofer-engine/ts-hl7'

export const queue = <T = IMsg>(
  id: string,
  process: (msg: T, timedOut: () => boolean) => Promise<boolean>,
  msg: T,
  options?: IQueueOptions<T>
) => {
  const q = goferQueue(id, process, options)
  q.push(msg)
}
