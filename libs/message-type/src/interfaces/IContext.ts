import { MsgTypes, TLogLevel } from '..';

// helper generics only above this line
export interface IContext {
  kind?: MsgTypes;
  // auto generated message uuid
  messageId?: string;
  channelId?: string | number;
  routeId?: string | number;
  // FIXME: add PII/PHI/Confidential flag(s) to logger
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
