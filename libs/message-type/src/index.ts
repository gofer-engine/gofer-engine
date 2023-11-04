/* eslint-disable @typescript-eslint/no-explicit-any */
// FIXME: find a way to implement strict typing instead of allowing any
import { SetRequired } from 'type-fest';

export type MsgTypes = 'HL7v2' | 'JSON';

// log levels in order of severity. If you show 'DEBUG' logs, you will also see 'INFO' logs, etc.
export type TLogLevel = 'debug' | 'info' | 'warn' | 'error';

// helper generics only above this line
export interface IContext {
  kind?: MsgTypes;
  // auto generated message uuid
  messageId?: string;
  channelId?: string | number;
  routeId?: string | number;
  // FIXME: add PII/PHI/Confidential flag to logger
  logger: (log: string, logLevel?: TLogLevel) => void;
  setGlobalVar: <V>(varName: string, varValue: V) => void;
  getGlobalVar: <V>(varName: string) => V | undefined;
  setChannelVar: <V>(varName: string, varValue: V) => void;
  getChannelVar: <V>(varName: string) => V | undefined;
  setRouteVar?: <V>(varName: string, varValue: V) => void;
  getRouteVar?: <V>(varName: string) => V | undefined;
  setMsgVar?: <V>(msgId: string, varName: string, varValue: V) => void;
  getMsgVar?: <V>(msgId: string, varName: string) => V | undefined;
}

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

export interface IMsg {
  kind: string;
  setMsg: (msg: any) => IMsg;
  json: (normalized?: boolean) => any;
  toString: () => string;
  set: (path?: string | undefined, value?: any) => IMsg;
  setJSON: (path: string | undefined, json: any) => IMsg;
  get: (path: string | undefined) => any;
  delete: (path: string) => IMsg;
  copy: (path: string, toPath: string) => IMsg;
  move: (fromPath: string, toPath: string) => IMsg;
  map: (
    path: string,
    v: string | Record<string, string> | string[] | (<T>(v: T, i: number) => T),
    options?: {
      iteration?: boolean | undefined;
    },
  ) => IMsg;
  setIteration: <Y>(
    path: string,
    map: Y[] | ((val: Y, i: number) => Y),
    options?: { allowLoop: boolean },
  ) => IMsg;
}

export const isMsg = (msg: unknown): msg is IMsg => {
  if (typeof msg !== 'object') return false;
  if (msg === null) return false;
  if (Array.isArray(msg)) return false;
  return (
    [
      'setMsg',
      'json',
      // 'addSegment',
      'toString',
      'set',
      'setJSON',
      'get',
      // 'getSegments',
      // 'getSegment',
      // 'id',
      // 'transform',
      'delete',
      'copy',
      'move',
      'map',
      'setIteration',
    ] as (keyof IMsg)[]
  ).every(
    (method) =>
      method in msg &&
      typeof (msg as unknown as Record<string, unknown>)[method] === 'function',
  );
};
