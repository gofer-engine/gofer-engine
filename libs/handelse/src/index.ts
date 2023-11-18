import { randomUUID } from 'node:crypto';
import { resolveObj } from './resolveObj';
import {
  IEventSystemManager,
  IEventHandler,
  IEventServer,
  IEventClient,
  IEventHandlerConfig,
  SubscriberID,
  SubFunc,
  TEventGetHandlerOptions,
} from './types';

export * from './types';

class EventClient<T> implements IEventClient<T> {
  public sub: IEventClient<T>['sub'];
  public subscribe: this['sub'];
  public on: this['sub'];
  public do: this['sub'];
  public start: this['sub'];
  public listen: this['sub'];
  public remove: IEventClient<T>['remove'];
  public unsub: this['remove'];
  public unsubscribe: this['remove'];
  public off: this['remove'];
  public stop: this['remove'];
  public deafen: this['remove'];
  constructor(handler: EventHandler<T>) {
    this.sub = handler.sub;
    this.subscribe = this.sub;
    this.on = this.sub;
    this.do = this.sub;
    this.start = this.sub;
    this.listen = this.sub;
    this.remove = handler.remove;
    this.unsub = this.remove;
    this.unsubscribe = this.remove;
    this.off = this.remove;
    this.stop = this.remove;
    this.deafen = this.remove;
  }
}

class EventServer<T> implements IEventServer<T> {
  public pub: IEventServer<T>['pub'];
  public publish: this['pub'];
  public go: this['pub'];
  public emit: this['pub'];
  public broadcast: this['pub'];
  public signal: this['pub'];
  constructor(handler: EventHandler<T>) {
    this.pub = handler.pub;
    this.publish = this.pub;
    this.go = handler.pub;
    this.emit = this.pub;
    this.broadcast = this.pub;
    this.signal = this.pub;
  }
}

class EventHandler<T> implements IEventHandler<T> {
  private quitEarly: boolean;
  public eventType: string | undefined;
  private global: boolean;
  private subscribers: Map<SubscriberID, SubFunc<T>> = new Map();
  constructor(options: IEventHandlerConfig & { global: boolean }) {
    this.quitEarly = options.quitEarly ?? false;
    this.global = options.global;
    this.eventType = options.eventType;
  }
  public getServer: () => EventServer<T> = () =>
    new EventServer(this) as IEventServer<T>;
  public getClient: () => EventClient<T> = () =>
    new EventClient(this) as IEventClient<T>;
  public pub = (event: T) => {
    if (
      this.global &&
      this.eventType !== undefined &&
      typeof event !== this.eventType
    ) {
      throw new Error(`
Event type does not match event handler type.
Expected: "${this.eventType}"
Received: "${typeof event}"
      `);
    }
    return new Promise<Record<SubscriberID, boolean>>((res) => {
      if (this.subscribers.size === 0) return res({});
      const results: Record<SubscriberID, ReturnType<SubFunc<T>>> = {};
      this.subscribers.forEach((handler, id) => {
        results[id] = handler(event);
      });
      res(resolveObj(results, this.quitEarly));
    });
  };
  public publish = this.pub;
  public go = this.pub;
  public emit = this.pub;
  public broadcast = this.pub;
  public signal = this.pub;
  public sub = (handler: SubFunc<T>) => {
    const id = randomUUID();
    this.subscribers.set(id, handler);
    return id;
  };
  public subscribe = this.sub;
  public on = this.sub;
  public do = this.sub;
  public start = this.sub;
  public listen = this.sub;
  public remove = (id: SubscriberID) => this.subscribers.delete(id);
  public unsub = this.remove;
  public unsubscribe = this.remove;
  public off = this.remove;
  public stop = this.remove;
  public deafen = this.remove;
}

// a global event handler that can be used to listen to all events
const _ALL_ = new EventHandler<unknown>({ global: true });

// a set of reserved event handler names that cannot be used
const RESERVED_HANDLES: readonly string[] = ['_ALL_'];

class EventSystemManager implements IEventSystemManager {
  private eventHandlers: Map<string, IEventHandler> = new Map();
  constructor() {
    this.eventHandlers.set('_ALL_', _ALL_);
  }
  public createGlobal = <T = unknown>(
    handle: string,
    options: IEventHandlerConfig = {},
  ) => {
    if (RESERVED_HANDLES.includes(handle)) {
      throw new Error(`Cannot use reserved event handler name: ${handle}`);
    }
    if (this.eventHandlers.has(handle)) {
      throw new Error('Event handler already exists');
    }
    const handler = new EventHandler<T>({ ...options, global: true });
    this.eventHandlers.set(handle, handler as IEventHandler);
    handler.sub((event) => {
      return _ALL_.pub(event as unknown).then((publishers) => {
        return Object.values(publishers).every((result) => result);
      });
    })
    return handler as IEventHandler<T>;
  };
  public create = this.createGlobal;
  public global = this.createGlobal;
  public createInstance = <T = unknown>(
    options: Omit<IEventHandlerConfig, 'eventType'> = {},
  ) => {
    const handler = new EventHandler<T>({
      ...options,
      global: false,
    });
    handler.sub((event) => {
      return _ALL_.pub(event as unknown).then((publishers) => {
        return Object.values(publishers).every((result) => result);
      });
    })
    return handler as IEventHandler<T>;
  };
  public instance = this.createInstance;
  public local = this.createInstance;
  public get = <T = unknown>(
    handle: string,
    options?: TEventGetHandlerOptions,
  ) => {
    let handler = this.eventHandlers.get(handle);
    if (!handler) {
      if (options?.createIfNotExists) {
        handler = this.create(handle, options);
      } else {
        throw new Error(`Event handler ${handle} does not exist`);
      }
    }
    if (
      options?.eventType !== undefined &&
      handler.eventType !== undefined &&
      options.eventType !== handler.eventType
    ) {
      throw new Error(`
Event type does not match event handler type.
Expected: "${options.eventType}"
Received: "${handler.eventType}"
      `);
    } else if (
      options?.verbose &&
      (options.eventType === undefined || handler.eventType === undefined) &&
      options.eventType !== handler.eventType
    ) {
      console.warn(`
Event type declared only on one side, so type checking was not possible
Options set event type: "${options.eventType ?? 'undefined'}"
Handler set event type: "${handler.eventType ?? 'undefined'}"
      `);
    }
    return handler as IEventHandler<T>;
  };
  public delete = (handle: string) => {
    if (handle === '_ALL_') {
      throw new Error('Cannot delete reserved event handler name: _ALL_');
    }
    return this.eventHandlers.delete(handle);
  }
  public pub = <T = unknown>(
    handle: string,
    event: T,
    options?: TEventGetHandlerOptions,
  ) => {
    if (handle === '_ALL_') {
      throw new Error('Cannot publish directly to reserved event handler name: _ALL_');
    }
    return this.get<T>(handle, options).pub(event);
  }
  public publish = this.pub;
  public go = this.pub;
  public emit = this.pub;
  public broadcast = this.pub;
  public signal = this.pub;
  public sub = <T = unknown>(
    handle: string,
    handler: SubFunc<T>,
    options?: TEventGetHandlerOptions,
  ) => this.get<T>(handle, options).sub(handler);
  public subscribe = this.sub;
  public on = this.sub;
  public do = this.sub;
  public start = this.sub;
  public listen = this.sub;
  public remove = (
    handle: string,
    id: SubscriberID,
    options?: TEventGetHandlerOptions,
  ) => this.get(handle, options).remove(id);
  public unsub = this.remove;
  public unsubscribe = this.remove;
  public off = this.remove;
  public stop = this.remove;
  public deafen = this.remove;
}

const eventSystemManager = new EventSystemManager();

Object.freeze(eventSystemManager);

export default eventSystemManager;
