import { IEventHandler } from '@gofer-engine/handelse';
import { logInfoLevel } from '../queue';

export * from './fileStore';
export * from './memoryStore';

export interface IStore<T> {
  check: () => Promise<boolean>;
  next: () => Promise<string | undefined>;
  last: () => Promise<string | undefined>;
  take: (id: string) => Promise<boolean>;
  get: (id: string) => Promise<T>;
  release: (id: string) => Promise<boolean>;
  releaseAll: () => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  push: (id: string, data: T) => Promise<boolean>;
  unshift: (id: string, data: T) => Promise<boolean>;
  rotate: (method: 'reverse' | 'ftl' | 'ltf' | 'shuffle') => Promise<boolean>;
  size: () => Promise<number>;
  clear: () => Promise<boolean>;
  takeNext: () => Promise<[id: string, task: T] | undefined>;
  retry: (id: string, maxRetries?: number) => Promise<boolean>;
  cleanup: () => void;
}

export interface IStoreEvents {
  onDebug: IEventHandler;
}

export interface IStoreOptions {
  logger?: (log: string, lvl?: logInfoLevel) => void;
  verbose?: boolean;
}

export const StoreDefaultOptions: Required<IStoreOptions> = {
  logger: () => {
    // purposefully void
  },
  verbose: false,
};
