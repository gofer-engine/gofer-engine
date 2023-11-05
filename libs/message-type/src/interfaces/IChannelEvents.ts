import { IEventHandler } from '@gofer-engine/handelse';
import { TLogLevel } from '..';

export interface IChannelEvents<T> {
  onReceive: IEventHandler<{ msg: T; channel: string | number }>;
  onAck: IEventHandler<{ msg: T; ack: T; channel: string | number }>;
  onFilter: IEventHandler<{
    msg: T;
    channel: string | number;
    flow: string | number;
    route?: string | number;
  }>;
  onIngest: IEventHandler<{
    pre: T;
    post: T | boolean;
    channel: string | number;
    accepted: boolean;
  }>;
  onTransform: IEventHandler<{
    pre: T;
    post: T;
    channel: string | number;
    route?: string | number;
    flow: string | number;
  }>;
  onQueue: IEventHandler<{
    msg: T;
    channel: string | number;
    queue: string | number;
    id: string | number;
  }>;
  onQueueStart: IEventHandler<{
    msg: T;
    channel: string | number;
    queue: string | number;
    id: string | number;
  }>;
  onQueueRetry: IEventHandler<{
    msg: T;
    channel: string | number;
    queue: string | number;
    id: string | number;
  }>;
  onQueueFail: IEventHandler<{
    msg: T;
    channel: string | number;
    queue: string | number;
    id: string | number;
  }>;
  onQueueRemove: IEventHandler<{
    msg: T;
    channel: string | number;
    queue: string | number;
    id: string | number;
  }>;
  onRouteStart: IEventHandler<{
    msg: T;
    channel: string | number;
    route: string | number;
  }>;
  onRouteEnd: IEventHandler<{
    msg: T;
    channel: string | number;
    route: string | number;
    status: boolean;
  }>;
  onComplete: IEventHandler<{
    orig: T;
    channel: string | number;
    status: boolean;
  }>;
  onError: IEventHandler<{
    error: unknown;
    channel: string | number;
    msg?: T;
    route?: string | number;
    flow?: string | number;
    queue?: string | number;
    id?: string | number;
  }>;
  onLog: IEventHandler<{
    log: unknown;
    channel: string | number;
    msg?: T;
    route?: string | number;
    flow?: string | number;
    queue?: string | number;
    id?: string | number;
    level?: TLogLevel;
  }>;
}
