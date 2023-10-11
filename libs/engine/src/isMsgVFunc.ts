import { MsgVFunc } from './types';

export const isMsgVFunc = <V>(filter: unknown): filter is MsgVFunc<V> => {
  return typeof filter === 'function' && filter.arguments.length === 2;
};
