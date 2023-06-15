import { IQueueOptions, queue as goferQueue } from '@gofer-engine/queue'
import Msg from '@gofer-engine/ts-hl7'

export const queue = <T = Msg>(
  id: string,
  process: (msg: T, timedOut: () => boolean) => Promise<boolean>,
  msg: T,
  options?: IQueueOptions<T>
) => {
  const q = goferQueue(id, process, options)
  q.push(msg)
}
