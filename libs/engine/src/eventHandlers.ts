import { IMsg } from '@gofer-engine/hl7';
import handelse, { SubFunc, SubscriberID } from '@gofer-engine/handelse';
import { ChannelConfig } from './types';
import { IChannelEvents } from './events';

export const onError = handelse.global<Error>('gofer:error');
onError.do((error) => {
  console.error(`${new Date().toISOString()}: [ERROR]`, error);
  return true;
});
export const throwError = onError.pub;

interface ILoggingConfig {
  console?: boolean;
}
let loggingConfig: Required<ILoggingConfig> = {
  console: true,
};

export const setLoggingConfig = (config = {}) => {
  loggingConfig = { ...loggingConfig, ...config };
};

export const onLog = handelse.global<unknown>('gofer:log');
onLog.do((log) => {
  if (loggingConfig.console) console.log(`${new Date().toISOString()}:`, log);
  return true;
});

export const log = (...props: unknown[]) => {
  onLog.pub(props);
};

export const onGoferStart = handelse.global<Date>('gofer:start');

export const preChannelInit =
  handelse.global<ChannelConfig>('gofer:channel:init');

export const publishers = {
  onGoferStart: onGoferStart.pub,
  preChannelInit: preChannelInit.pub,
  onError: onError.pub,
  onLog: onLog.pub,
};

type TListeners = {
  onGoferStart: (handler: SubFunc<Date>) => SubscriberID;
  preChannelInit: (handler: SubFunc<ChannelConfig>) => SubscriberID;
  onError: (handler: SubFunc<Error>) => SubscriberID;
  onLog: (handler: SubFunc<unknown>) => SubscriberID;
  channels: Record<string, IChannelEvents<IMsg>>;
};

export const listeners: TListeners = {
  onGoferStart: onGoferStart.sub,
  preChannelInit: preChannelInit.sub,
  onError: onError.sub,
  onLog: onLog.sub,
  channels: {},
};

export default {
  publishers,
  listeners,
};
