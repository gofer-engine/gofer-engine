export interface IEventHandlerConfig {
  quitEarly?: boolean
  eventType?: string
}
export type SubFunc<T> = (event: T) => boolean | Promise<boolean>
export type SubscriberID = string | number
type PubResponse = Promise<Record<SubscriberID, boolean>>

type TCreateGlobal<T> = (
  handle: string,
  options?: IEventHandlerConfig,
) => IEventHandler<T>

type TCreateInstance<T> = (
  options?: Omit<IEventHandlerConfig, 'eventType'>,
) => IEventHandler<T>

export interface IEventSystemManager {
  createGlobal: TCreateGlobal<unknown>
  create: this['createGlobal']
  global: this['createGlobal']
  createInstance: TCreateInstance<unknown>
  instance: this['createInstance']
  local: this['createInstance']
  get: <T = unknown>(handle: string) => IEventHandler<T>
  delete: (handle: string) => boolean
  // uses type casting to allow for a generic type to be passed in
  // The actual implementation is using loosely typed functions
  pub: <T = unknown>(handle: string, event: T) => PubResponse
  publish: this['pub']
  go: this['pub']
  emit: this['pub']
  broadcast: this['pub']
  signal: this['pub']
  // uses type casting to allow for a generic type to be passed in
  // The actual implementation is using loosely typed functions
  sub: <T = unknown>(handle: string, handler: SubFunc<T>) => SubscriberID
  subscribe: this['sub']
  on: this['sub']
  do: this['sub']
  start: this['sub']
  listen: this['sub']
  remove: (handle: string, id: SubscriberID) => boolean
  unsub: this['remove']
  unsubscribe: this['remove']
  off: this['remove']
  stop: this['remove']
  deafen: this['remove']
}
export interface IEventHandler<T = unknown>
  extends IEventServer<T>,
    IEventClient<T> {
  getServer: () => IEventServer<T>
  getClient: () => IEventClient<T>
  eventType?: string
}
export interface IEventServer<T = unknown> {
  pub: (event: T) => PubResponse
  publish: this['pub']
  go: this['pub']
  emit: this['pub']
  broadcast: this['pub']
  signal: this['pub']
}
export interface IEventClient<T = unknown> {
  sub: (handler: SubFunc<T>) => SubscriberID
  subscribe: this['sub']
  on: this['sub']
  do: this['sub']
  start: this['sub']
  listen: this['sub']
  remove: (id: SubscriberID) => boolean
  unsub: this['remove']
  unsubscribe: this['remove']
  off: this['remove']
  stop: this['remove']
  deafen: this['remove']
}
