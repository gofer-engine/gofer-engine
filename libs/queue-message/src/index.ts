import { IMsg } from '@gofer-engine/message-type';
import queue, { IQueueOptions } from "@gofer-engine/queue";

export const queueMessage = (
  id: string,
  process: (msg: IMsg, timedOut: () => boolean) => Promise<boolean>,
  msg: IMsg,
  options?: IQueueOptions<IMsg>,
) => {
  const q = queue(id, process, options);
  q.push(msg);
};