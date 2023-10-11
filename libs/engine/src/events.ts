import handelse from '@gofer-engine/handelse';
import { IEventHandler } from '@gofer-engine/handelse';
import { TLogLevel } from './types';

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

export const events = <T>(channel: string): IChannelEvents<T> => {
  const onReceive = handelse.create<{ msg: T; channel: string | number }>(
    `gofer:${channel}.onReceive`,
  );
  const onAck = handelse.create<{ msg: T; ack: T; channel: string | number }>(
    `gofer:${channel}.onAck`,
  );
  const onFilter = handelse.create<{
    msg: T;
    channel: string | number;
    flow: string | number;
    route?: string | number;
  }>(`gofer:${channel}.onFilter`);
  const onIngest = handelse.create<{
    pre: T;
    post: T | boolean;
    channel: string | number;
    accepted: boolean;
  }>(`gofer:${channel}.onIngest`);
  const onTransform = handelse.create<{
    pre: T;
    post: T;
    channel: string | number;
    route?: string | number;
    flow: string | number;
  }>(`gofer:${channel}.onTransform`);
  const onQueue = handelse.create<{
    msg: T;
    channel: string | number;
    queue: string | number;
    id: string | number;
  }>(`gofer:${channel}.onQueue`);
  const onQueueStart = handelse.create<{
    msg: T;
    channel: string | number;
    queue: string | number;
    id: string | number;
  }>(`gofer:${channel}.onQueueStart`);
  const onQueueRetry = handelse.create<{
    msg: T;
    channel: string | number;
    queue: string | number;
    id: string | number;
  }>(`gofer:${channel}.onQueueRetry`);
  const onQueueFail = handelse.create<{
    msg: T;
    channel: string | number;
    queue: string | number;
    id: string | number;
  }>(`gofer:${channel}.onQueueFail`);
  const onQueueRemove = handelse.create<{
    msg: T;
    channel: string | number;
    queue: string | number;
    id: string | number;
  }>(`gofer:${channel}.onQueueRemove`);
  const onRouteStart = handelse.create<{
    msg: T;
    channel: string | number;
    route: string | number;
  }>(`gofer:${channel}.onRouteStart`);
  const onRouteEnd = handelse.create<{
    msg: T;
    channel: string | number;
    route: string | number;
    status: boolean;
  }>(`gofer:${channel}.onRouteEnd`);
  const onComplete = handelse.create<{
    channel: string | number;
    orig: T;
    status: boolean;
  }>(`gofer:${channel}.onComplete`);
  const onError = handelse.create<{
    error: unknown;
    channel: string | number;
    msg?: T;
    route?: string | number;
    flow?: string | number;
    queue?: string | number;
    id?: string | number;
  }>(`gofer:${channel}.onError`);
  const onLog = handelse.create<{
    log: unknown;
    channel: string | number;
    level?: TLogLevel;
    msg?: T;
    route?: string | number;
    flow?: string | number;
    queue?: string | number;
    id?: string | number;
  }>(`gofer:${channel}.onLog`);

  return {
    onReceive,
    onAck,
    onFilter,
    onIngest,
    onTransform,
    onQueue,
    onQueueStart,
    onQueueRetry,
    onQueueFail,
    onQueueRemove,
    onRouteStart,
    onRouteEnd,
    onComplete,
    onError,
    onLog,
  };
};
