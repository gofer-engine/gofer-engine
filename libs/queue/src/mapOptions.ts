import { GetMsgType, IMsg } from "@gofer-engine/message-type";
// import { getMsgType } from "../../engine/src";
import { IQueueOptions } from "./queue";
import { QueueConfig } from "./types";

export const mapOptions = (opt: QueueConfig, getMsgType: GetMsgType): IQueueOptions<IMsg> => {
  return {
    filo: opt.filo,
    max_retries: opt.retries,
    max_timeout: opt.maxTimeout,
    workers: opt.concurrent,
    workerLoopInterval: opt.afterProcessDelay,
    store: opt.store,
    id: opt.id,
    allowUndefined: false,
    msgType: opt.msgType,
    storeStringify: (msg) => msg.toString(),
    storeParse: (msg) => getMsgType(opt.msgType ?? 'HL7v2', msg),
    verbose: opt.verbose,
  };
};
