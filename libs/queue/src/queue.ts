import { randomUUID } from 'node:crypto';
import { IStore } from './stores';
import { FileStore } from './stores/fileStore';
import { MemoryStore } from './stores/memoryStore';
import { IWorkerEvents, TStatus, Worker } from './worker';
import handelse, { IEventHandler, SubFunc } from '@gofer-engine/handelse';

interface IWStatus {
  status: TStatus;
  lastStarted?: Date;
  lastCompleted?: Date;
  processed: number;
  processing?: string;
}

export interface IQueueOptions<T> {
  filo?: boolean;
  max_retries?: number;
  max_timeout?: number;
  workers?: number;
  workerLoopInterval?: number;
  store?: 'memory' | 'file';
  id?: (task: T) => string;
  // allow undefined to be pushed to the queue
  allowUndefined?: boolean;
  storeStringify?: (task: T) => string;
  storeParse?: (task: string) => T;
  verbose?: boolean;
}

interface IQueueEvents<T> {
  onInit: IEventHandler<IQueueOptions<T>>;
  onPush: IEventHandler<[id: string, task: T]>;
  onWorkerStart: IEventHandler<string>;
  onWorkerStop: IEventHandler<string>;
}

export interface IQueue<T> {
  process: (task: T, timedOut: () => boolean) => Promise<boolean>;
  options: Required<IQueueOptions<T>>;
  logger: (message: string) => void;
  push: (task: T) => Promise<boolean>;
  unshift: (task: T) => Promise<boolean>;
  startAllWorkers: () => void;
  stopAllWorkers: () => void;
  workerStatus: () => IWStatus[];
  destroy: () => void;
}

export type logInfoLevel = 'info' | 'warn' | 'error' | 'debug';

export class Queue<T> implements IQueue<T> {
  private store: IStore<T>;
  private id: string;
  public readonly process: IQueue<T>['process'];
  public readonly logger = (message: string, lvl?: logInfoLevel) => {
    const log = () => console.log(`[queue:${this.id}] ${message}`);
    // verbose logs all, default only log warn and error
    if (this.options.verbose) {
      return log();
    } else {
      if (lvl === 'warn') return log();
      if (lvl === 'error') return log();
    }
  };
  private defaultOptions: Required<IQueueOptions<T>> = {
    filo: false, // first in, first out
    max_retries: Infinity, // no limit
    max_timeout: 60000, // 1 minute
    workers: 1,
    workerLoopInterval: 1000, // 1 second
    store: 'memory',
    id: () => randomUUID(),
    allowUndefined: false,
    storeStringify: (task) => JSON.stringify(task),
    storeParse: (task) => JSON.parse(task),
    verbose: false,
  };
  public readonly options: Required<IQueueOptions<T>>;
  private events: IQueueEvents<T> = {
    onInit: handelse.instance<IQueueOptions<T>>(),
    onPush: handelse.instance<[id: string, task: T]>(),
    onWorkerStart: handelse.instance<string>(),
    onWorkerStop: handelse.instance<string>(),
  };
  private workers: Worker<T>[] = [];
  constructor(
    id: string,
    process: IQueue<T>['process'],
    options: IQueueOptions<T> = {},
  ) {
    this.id = id;
    this.process = process;
    if (options.verbose) {
      this.events.onPush.sub(([id, task]) => {
        this.logger(`onPush: [id:${id}] = ${JSON.stringify(task)}`);
        return true;
      });
      this.events.onInit.sub((options) => {
        this.logger(`onPush: ${JSON.stringify(options)}`);
        return true;
      });
      this.events.onWorkerStart.sub((id) => {
        this.logger(`onWorkerStart: ${id}`);
        return true;
      });
      this.events.onWorkerStop.sub((id) => {
        this.logger(`onWorkerStop: ${id}`);
        return true;
      });
    }
    this.options = { ...this.defaultOptions, ...options };
    this.logger('Queue created', 'info');
    if (this.options.store === 'file') {
      this.store = new FileStore({
        id,
        stringify: options.storeStringify,
        parse: options.storeParse,
        logger: this.logger,
      });
    } else {
      this.store = new MemoryStore({
        logger: this.logger,
        verbose: this.options.verbose,
      });
    }
    for (let i = 0; i < this.defaultOptions.workers; i++) {
      const w = new Worker<T>(this, this.store);
      this.workers.push(w);
      this.events.onWorkerStart.pub(w.id);
    }
    this.events.onInit.pub(this.options);
  }
  public on = <K extends keyof (IQueueEvents<T> & IWorkerEvents<T>)>(
    event: K,
    listener: Parameters<(IQueueEvents<T> & IWorkerEvents<T>)[K]['sub']>[0],
  ) => {
    // if (this.events.hasOwnProperty(event)) {
    if (Object.prototype.hasOwnProperty.call(this.events, event)) {
      return this.events[event as keyof IQueueEvents<T>].sub(
        listener as SubFunc<unknown>,
      );
    }
    const e = event as keyof IWorkerEvents<T>;
    const l = listener as SubFunc<unknown>;
    return this.workers.map((w) => w.on(e, l));
  };
  public push = async (task: T, id?: string) => {
    if (!id) id = randomUUID();
    await this.events.onPush.pub([id, task]);
    return this.store.push(id, task).then((pushed) => {
      if (!pushed) return pushed;
      // start a single worker, if idle.
      this.workers.some((w) => {
        if (w.status() !== 'idle') return false;
        w.start();
        this.events.onWorkerStart.pub(w.id);
        return true;
      });
      return pushed;
    });
  };
  public unshift = async (task: T, id?: string) => {
    if (!id) id = randomUUID();
    await this.events.onPush.pub([id, task]);
    return this.store.unshift(id, task).then((pushed) => {
      if (!pushed) return pushed;
      // start a single worker, if idle.
      this.workers.some((w) => {
        if (w.status() !== 'idle') return false;
        w.start();
        this.events.onWorkerStart.pub(w.id);
        return true;
      });
      return pushed;
    });
  };
  public startAllWorkers = () => {
    this.workers.forEach((w) => {
      if (
        w.status() !== 'idle' &&
        w.status() !== 'sleeping' &&
        w.status() !== 'running'
      )
        return;
      w.start();
      this.events.onWorkerStart.pub(w.id);
    });
  };
  public stopAllWorkers = () => {
    this.workers.forEach((w) => {
      if (w.status() !== 'stopped') return;
      w.stop();
      this.events.onWorkerStop.pub(w.id);
    });
  };
  public workerStatus = () =>
    this.workers.map((w) => {
      const status: IWStatus = {
        status: w.status(),
        processed: w.processed(),
      };
      const lastStarted = w.lastStarted();
      const lastCompleted = w.lastCompleted();
      const processing = w.processing();
      if (lastStarted) status.lastStarted = lastStarted;
      if (lastCompleted) status.lastCompleted = lastCompleted;
      if (processing) status.processing = processing;
      return status;
    });
  public destroy = () => {
    this.stopAllWorkers();
    this.store.cleanup();
  };
}
