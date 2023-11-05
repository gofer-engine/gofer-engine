import handelse from '@gofer-engine/handelse';

import { onError } from './onError';
import { TListeners } from './types';
import { ILoggingConfig } from './interfaces';

const _config: { config: Required<ILoggingConfig> } = {
  config: {
    console: true,
  },
};

export const setLoggingConfig = (config = {}) => {
  _config.config = { ..._config.config, ...config };
};

export const onLog = handelse.global<unknown>('gofer:log');
onLog.do((log) => {
  if (_config.config.console) console.log(`${new Date().toISOString()}:`, log);
  return true;
});

export const log = (...props: unknown[]) => {
  onLog.pub(props);
};

export const publishers = {
  onError: onError.pub,
  onLog: onLog.pub,
};

export const listeners: TListeners = {
  onError: onError.sub,
  onLog: onLog.sub,
  channels: {},
};
