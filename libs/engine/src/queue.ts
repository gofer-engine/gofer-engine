import { IQueueOptions, queue as goferQueue } from '@gofer-engine/queue';
import { IMsg } from '@gofer-engine/message-type';

export const queue = (
  id: string,
  process: (msg: IMsg, timedOut: () => boolean) => Promise<boolean>,
  msg: IMsg,
  options?: IQueueOptions<IMsg>,
) => {
  const q = goferQueue(id, process, options);
  q.push(msg);
};
