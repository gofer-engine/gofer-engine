import { IMsg, MsgTypes } from "@gofer-engine/message-type";

export interface QueueConfig {
  kind: 'queue';
  // interval?: number // milliseconds between retries. Defaults to 10x1000 = 10 seconds
  // FIXME: better-queue does not currently support a queue limit.
  // limit?: number // Limit the number of messages that can be queued. Defaults to Infinity
  filo?: boolean; // First In Last Out. Defaults to false
  retries?: number; // Defaults to Infinity
  // TODO: `id` function is limited to only root key of T, change this to take the data and return the exact id.
  // id?: keyof T | ((task: T, cb: (error: any, id: keyof T | { id: string }) => void) => void) |  ((task: T, cb: (error: any, id: keyof T) => void) => void) // used to uniquely identify the items in queue
  id?: (msg: IMsg) => string; // used to uniquely identify the items in queue
  // filterQueue?: (msg: T) => boolean | Promise<boolean> // Used to conditionally filter what messages are allowed to enter the queue. Return true to pass the message through to the queue, false to drop it. If undefined, then all messages are allowed.
  // precondition?: (cb: (error: unknown, passOrFail: boolean) => void) => void
  // preconditionRetryTimeout?: number // Number of milliseconds to delay before checking the precondition function again. Defaults to 10x1000 = 10 seconds.
  // onEvents?: [
  //   event: QueueEvents,
  //   listener: (id: string, queueId: string | number, error?: string) => void
  // ][]
  // TODO: implement store config for the queue
  // storage?: StoreConfig
  concurrent?: number; // Allows more than one message to be processed assynchronously if > 1. Defaults to 1.
  maxTimeout?: number; // Number of milliseconds before a task is considered timed out. Defaults to 10x1000 = 10 seconds
  // TODO: implement another delay option for after the process is complete before the next message is processed
  afterProcessDelay?: number; // Number of ms to to interval loop the worker checking for completion of process to begin next. Defaults to 1x1000 = 1 second.
  rotate?: boolean; // Rotate the queue moving a failed message to the end of the queu. Defaults to false
  verbose?: boolean; // Log messages to console. Defaults to false
  store: 'file' | 'memory';
  msgType?: MsgTypes; // defaults to HL7v2
  stringify?: (msg: IMsg) => string;
  parse?: (msg: string) => IMsg;
}
