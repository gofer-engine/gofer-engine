import { SetRequired } from 'type-fest';
import { IContext, IMsg } from '.';

export type MsgTypes = 'HL7v2' | 'JSON' | 'XML';

// log levels in order of severity. If you show 'DEBUG' logs, you will also see 'INFO' logs, etc.
export type TLogLevel = 'debug' | 'info' | 'warn' | 'error';

export type IMessageContext = SetRequired<
  IContext,
  'messageId' | 'channelId' | 'getMsgVar' | 'setMsgVar' | 'kind'
>;

export type IAckContext = IMessageContext & {
  filtered: boolean;
};

export type JSONValue =
  | undefined
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>;

export type IngestMsgFunc = (
  msg: IMsg,
  ack: AckFunc | undefined,
  context: IMessageContext,
) => Promise<boolean>;

export type AckFunc = (ack: IMsg, context: IMessageContext) => void;

export type FunctProp<R> = ((msg: IMsg, context: IMessageContext) => R) | R;

export type AllowFuncProp<Allow, R> = Allow extends true ? FunctProp<R> : R;

// FIXME: find a way to implement strict typing instead of allowing any
/* eslint-disable @typescript-eslint/no-explicit-any */
export type GetMsgType = <T extends MsgTypes>(msg: T, ...props: any) => IMsg;
/* eslint-enable @typescript-eslint/no-explicit-any */

export type AckConfig = {
  // Value to use in ACK MSH.3
  application?: string; // defaults to "gofor Engine"
  // Value to use in ACK MSH.4
  organization?: string; // defaults to empty string ""
  responseCode?:
    | 'AA' // Application Accept. Default
    | 'AE' // Application Error
    | 'AR'; // Application Reject
  // A Store configuration to save persistent messages
  text?: string; // Text to use in ACK MSA.3
  msg?: (ack: IMsg, msg: IMsg, context: IAckContext) => IMsg; // returns the ack message to send
};
