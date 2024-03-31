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

export class EventClient<T> implements IEventClient<T> {
  public sub: IEventClient<T>['sub'];
  public subscribe: this['sub'];
  public on: this['sub'];
  public do: this['sub'];
  public start: this['sub'];
  public listen: this['sub'];
  public remove: IEventClient<T>['remove'];
  public removeAll: IEventClient<T>['removeAll'];
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
    this.removeAll = handler.removeAll;
    this.unsub = this.remove;
    this.unsubscribe = this.remove;
    this.off = this.remove;
    this.stop = this.remove;
    this.deafen = this.remove;
  }
}

export class EventServer<T> implements IEventServer<T> {
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

let INSTANCE_ID = 0;

export class EventHandler<T> implements IEventHandler<T> {
  public id: number;

  /**
   * This is a boolean that determines if the event handler should quit early
   * after the first subscriber that resolves to a truthy value. Otherwise, it
   * will wait for all subscribers to resolve before returning.
   */
  private quitEarly: boolean;

  /**
   * This is the type of the event handler
   */
  public eventType: string | undefined;

  /**
   * This is just a flag to determine if the event handler is global or not
   */
  private global: boolean;
  
  /**
   * This is a map of subscriber IDs to subscriber functions
   */
  private subscribers: Map<SubscriberID, SubFunc<T>> = new Map();
  
  constructor(options: IEventHandlerConfig & { global: boolean }) {
    INSTANCE_ID++;
    this.id = INSTANCE_ID;
    this.quitEarly = options.quitEarly ?? false;
    this.global = options.global;
    this.eventType = options.eventType;
  }

  /**
   * This method is used to get a server subclass of this event handler
   * This is useful for passing to other scoped that should not have access to
   * the client methods.
   * @returns The server subclass of this event handler
   */
  public getServer: () => EventServer<T> = () =>
    new EventServer(this) as IEventServer<T>;
  
  /**
   * This method is used to get a client subclass of this event handler
   * This is useful for passing to other scoped that should not have access to
   * the server methods.
   * @returns The client subclass of this event handler
   */
  public getClient: () => EventClient<T> = () =>
    new EventClient(this) as IEventClient<T>;
  
  /**
   * This method is used to publish an event to this event handler
   * @param event - The event to publish
   * @returns A promise that resolves to an object of subscriber IDs and their
   * resolved values of accepting or rejecting the event.
   */
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
  /**
   * Alias for `pub`
   */
  public publish = this.pub;
  /**
   * Alias for `pub`
   */
  public go = this.pub;
  /**
   * Alias for `pub`
   */
  public emit = this.pub;
  /**
   * Alias for `pub`
   */
  public broadcast = this.pub;
  /**
   * Alias for `pub`
   */
  public signal = this.pub;

  /**
   * This method is used to add a subscriber to this event handler
   * @param handler - The subscriber function to add
   * @param id (optional) - The subscriber ID to use instead of a random UUID
   * @returns - The subscriber ID used or error if the ID already exists
   */
  public sub = (func: SubFunc<T>, id?: string) => {
    if (id !== undefined && this.subscribers.has(id)) {
      throw new Error('Subscriber ID already exists');
    }
    const ID = id ?? randomUUID();
    this.subscribers.set(ID, func);
    return ID;
  };
  /**
   * Alias for `sub`
   */
  public subscribe = this.sub;
  /**
   * Alias for `sub`
   */
  public on = this.sub;
  /**
   * Alias for `sub`
   */
  public do = this.sub;
  /**
   * Alias for `sub`
   */
  public start = this.sub;
  /**
   * Alias for `sub`
   */
  public listen = this.sub;
  
  /**
   * This method is used to remove a subscriber from this event handler
   * @param id - The subscriber ID to remove
   * @returns true if the subscriber existed and was removed, false if the
   * subscriber did not exist
   */
  public remove = (id: SubscriberID) => this.subscribers.delete(id);
  /**
   * Alias for `remove`
   */
  public unsub = this.remove;
  /**
   * Alias for `remove`
   */
  public unsubscribe = this.remove;
  /**
   * Alias for `remove`
   */
  public off = this.remove;
  /**
   * Alias for `remove`
   */
  public stop = this.remove;
  /**
   * Alias for `remove`
   */
  public deafen = this.remove;

  /**
   * This method is used to remove all subscribers from this event handler
   * @returns true
   */
  public removeAll = () => {
    this.subscribers.clear();
    // FIXME: Do we need to resub the `_ALL_` handler?
    return true;
  }
}

// a global event handler that can be used to listen to all events
const _ALL_ = new EventHandler<unknown>({ global: true });

// a set of reserved event handler names that cannot be removed or overwritten
const RESERVED_HANDLES: string[] = ['_ALL_'];

export class EventSystemManager implements IEventSystemManager {
  private readonly reservedHandles: string[]
  // a map of all global event handlers
  private eventHandlers: Map<string, IEventHandler> = new Map();
  constructor(
    reservedHandles: string[] = RESERVED_HANDLES
  ) {
    if (!reservedHandles.includes('_ALL_')) {
      reservedHandles.push('_ALL_');
    };
    this.reservedHandles = reservedHandles;
    this.eventHandlers.set('_ALL_', _ALL_);
  }

  /**
   * This method is used to create a global event handler, which is accessible
   * anywhere in the application by using `get` method with the same handle.
   * @param handle - The global event handler name to create
   * @param options.getIfAlreadyCreated - Options to allow getting the event
   * handler if it already exists, otherwise if it exists it will throw an
   * error.
   * @param options.eventType - Options to allow runtime type checking of the
   * event handler
   * @param options.quitEarly - Options to allow quitting early (after the first
   * subscriber that resolves to a truthy value)
   * @returns IEventHandler - The global event handler created
   */
  public createGlobal = <T = unknown>(
    handle: string,
    options: IEventHandlerConfig = {},
  ): IEventHandler<T> => {
    if (this.reservedHandles.includes(handle)) {
      throw new Error(`Cannot use reserved event handler name: ${handle}`);
    }
    if (this.eventHandlers.has(handle)) {
      if (options.getIfAlreadyCreated) {
        return this.get<T>(handle, options);
      }
      throw new Error('Event handler already exists');
    }
    const handler = new EventHandler<T>({ ...options, global: true });
    this.eventHandlers.set(handle, handler as IEventHandler);
    handler.sub((event) => {
      return _ALL_.pub([handle, event] as unknown).then((publishers) => {
        return Object.values(publishers).every((result) => result);
      });
    })
    return handler;
  };
  /**
   * Alias for `createGlobal`
   */
  public create = this.createGlobal;
  /**
   * Alias for `createGlobal`
   */
  public global = this.createGlobal;

  /**
   * This method is used to create  a local event handler, which is not
   * accessible outside of the current scope
   * @param options.quitEarly - Options to allow quitting early (after the first
   * subscriber that resolves to a truthy value)
   * @returns IEventHandler - The local event handler created
   */
  public createInstance = <T = unknown>(
    options: Omit<IEventHandlerConfig, 'eventType'|'getIfAlreadyCreated'> = {},
  ) => {
    const handler = new EventHandler<T>({
      ...options,
      global: false,
    });
    handler.sub((event) => {
      return _ALL_.pub([handler.id, event] as unknown).then((publishers) => {
        return Object.values(publishers).every((result) => result);
      });
    })
    return handler as IEventHandler<T>;
  };
  /**
   * Alias for `createInstance`
   */
  public instance = this.createInstance;
  /**
   * Alias for `createInstance`
   */
  public createLocal = this.createInstance;
  /**
   * Alias for `createInstance`
   */
  public local = this.createInstance;

  /**
   * This method is used to get a global event handler
   * @param handle - The global event handler name to get
   * @param options.createIfNotExists - Options to allow creating the event handler if it does not exist
   * @param options.eventType - Options to allow runtime type checking of the event handler
   * @param options.verbose - Options to allow verbose logging
   * @returns IEventHandler - The global event handler requested
   */
  public get = <T = unknown>(
    handle: string,
    options?: TEventGetHandlerOptions,
  ): IEventHandler<T> => {
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

  /**
   * This method is used to delete a global event handler
   * @param handle - The global event handler name to delete
   * @returns 
   */
  public delete = (handle: string) => {
    if (handle === '_ALL_') {
      throw new Error('Cannot delete reserved event handler name: _ALL_');
    }
    return this.eventHandlers.delete(handle);
  }

  /**
   * This method is used to clear all global event handlers besides the reserved
   * `_ALL_` event handler. This will allow javascript to garbage collect the
   * event handlers after they are no longer referenced to free up memory.
   */
  public clear = () => {
    this.eventHandlers.set('_ALL_', _ALL_);
  }

  /**
   * This method is used to publish an event to a global event handler
   * @param handle - The global event handler name to publish to
   * @param event - The event to publish
   * @param options - Options to pass to `get`
   * @returns 
   */
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
  /**
   * Alias for `pub`
   */
  public publish = this.pub;
  /**
   * Alias for `pub`
   */
  public go = this.pub;
  /**
   * Alias for `pub`
   */
  public emit = this.pub;
  /**
   * Alias for `pub`
   */
  public broadcast = this.pub;
  /**
   * Alias for `pub`
   */
  public signal = this.pub;

  /**
   * This method is used to add a subscriber to a global event handler
   * @param handle - The global event handler name to subscribe to
   * @param handler - The subscriber function to add
   * @param options - Options to pass to `get`
   * @returns 
   */
  public sub = <T = unknown>(
    handle: string,
    handler: SubFunc<T>,
    options?: TEventGetHandlerOptions,
  ) => this.get<T>(handle, options).sub(handler);
  /**
   * Alias for `sub`
   */
  public subscribe = this.sub;
  public on = this.sub;
  /**
   * Alias for `sub`
   */
  public do = this.sub;
  /**
   * Alias for `sub`
   */
  public start = this.sub;
  /**
   * Alias for `sub`
   */
  public listen = this.sub;
  
  /**
   * This method is used to add a subscriber to the reserved `_ALL_` event
   * @param func - The subscriber function to add
   * @param id - The subscriber ID to use instead of a random UUID
   * @returns the subscriber ID if the subscriber was added, errors if the
   * subscriber ID already exists
   */
  public subAll = <T>(
    func: SubFunc<T>,
    id?: string,
  ) => this.get<T>('_ALL_').sub(func, id);
  /**
   * Alias for `subAll`
   */
  public all = this.subAll;
  /**
   * Alias for `subAll`
   */
  public subscribeAll = this.subAll;
  /**
   * Alias for `subAll`
   */
  public onAll = this.subAll;
  /**
   * Alias for `subAll`
   */
  public doAll = this.subAll;
  /**
   * Alias for `subAll`
   */
  public startAll = this.subAll;
  /**
   * Alias for `subAll`
   */
  public listenAll = this.subAll;

  /**
   * This method is used to remove a subscriber from a global event handler
   * @param handle - The global event handler name to remove a subscriber from
   * @param id - The subscriber ID to remove
   * @param options - Options to pass to `get`
   * @returns true if the subscriber was removed, errors if the subscriber did not exist
   */
  public remove = (
    handle: string,
    id: SubscriberID,
    options?: TEventGetHandlerOptions,
  ) => this.get(handle, options).remove(id);
  /**
   * Alias for `remove`
   */
  public unsub = this.remove;
  /**
   * Alias for `remove`
   */
  public unsubscribe = this.remove;
  /**
   * Alias for `remove`
   */
  public off = this.remove;
  /**
   * Alias for `remove`
   */
  public stop = this.remove;
  /**
   * Alias for `remove`
   */
  public deafen = this.remove;

  /**
   * This method is used to remove all subscribers from a global event handler
   * @param handle - The global event handler name to remove all subscribers from
   */
  public removeAllSubs = (handle: string) => {
    this.get(handle).removeAll();
  };
}

export const eventSystemManager = new EventSystemManager();

Object.freeze(eventSystemManager);

export default eventSystemManager;
