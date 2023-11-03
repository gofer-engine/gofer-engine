import { SetRequired, RequireAtLeastOne, RequireExactlyOne } from 'type-fest'
import { StoreConfig } from '@gofer-engine/stores';
import { HL7v2, Message, StrictMessage } from '@gofer-engine/hl7';
import { IAckContext, IMessageContext, IMsg, JSONValue, MsgTypes, TLogLevel } from '@gofer-engine/message-type';
import JSONMsg from '@gofer-engine/json';

export type varTypes = 'Global' | 'Channel' | 'Route' | 'Msg';

export type FunctProp<R> = ((msg: IMsg, context: IMessageContext) => R) | R;
export type AllowFuncProp<Allow, R> = Allow extends true ? FunctProp<R> : R;

export interface ITcpConfig<Functional extends boolean = false> {
  msgType?: MsgTypes; // defaults to HL7v2
  host: AllowFuncProp<Functional, string>;
  port: AllowFuncProp<Functional, number>;
  SoM?: AllowFuncProp<Functional, string>; // Start of Message: defaults to `Sting.fromCharCode(0x0b)`
  EoM?: AllowFuncProp<Functional, string>; // End of Message: defaults to `String.fromCharCode(0x1c)`
  CR?: AllowFuncProp<Functional, string>; // Carriage Return: defaults to `String.fromCharCode(0x0d)`
  maxConnections?: number; // used only for server TCP connections
}

export interface IHTTPConfig<Functional extends boolean = false> {
  msgType?: MsgTypes; // defaults to HL7v2
  host: AllowFuncProp<Functional, string>;
  port: AllowFuncProp<Functional, number>;
  method?:
    | 'GET'
    | 'HEAD'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'CONNECT'
    | 'OPTIONS'
    | 'TRACE'
    | 'PATCH';
  path?: string;
  basicAuth?: {
    username: AllowFuncProp<Functional, string>;
    password: AllowFuncProp<Functional, string>;
  };
}

export interface IHTTPSConfig<Functional extends boolean = false>
  extends IHTTPConfig<Functional> {
  // props for cert/ssl support from tls.connect
  ca?: AllowFuncProp<Functional, string | string[] | Buffer | Buffer[]>;
  cert?: AllowFuncProp<Functional, string | string[] | Buffer | Buffer[]>;
  ciphers?: AllowFuncProp<Functional, string>;
  clientCertEngine?: AllowFuncProp<Functional, string>;
  crl?: AllowFuncProp<Functional, string | string[] | Buffer | Buffer[]>;
  dhparam?: AllowFuncProp<Functional, string | Buffer>;
  ecdhCurve?: AllowFuncProp<Functional, string>;
  honorCipherOrder?: AllowFuncProp<Functional, boolean>;
  key?: AllowFuncProp<Functional, string | string[] | Buffer | Buffer[]>;
  passphrase?: AllowFuncProp<Functional, string>;
  pfx?: AllowFuncProp<
    Functional,
    | string
    | string[]
    | Buffer
    | Buffer[]
    | { buf: string | Buffer; passphrase?: string }[]
  >;
  secureOptions?: AllowFuncProp<Functional, number>;
  secureProtocol?: AllowFuncProp<Functional, string>;
  sessionIdContext?: AllowFuncProp<Functional, string>;
  rejectUnauthorized?: AllowFuncProp<Functional, boolean>;
  severname?: AllowFuncProp<Functional, string>;
}

export interface QueueConfig {
  kind: 'queue';
  // interval?: number // milliseconds between retries. Defaults to 10x1000 = 10 seconds
  // FIXME: better-queue does not currently support a queue limit.
  // limit?: number // Limit the number of messages that can be queued. Defaults to Infinity
  filo?: boolean; // First In Last Out. Defaults to false
  retries?: number; // Defaults to Infinity
  // TODO: `id` function is limited to only root key of T, change this to take the data and return the exact id.
  // id?: keyof T | ((task: T, cb: (error: any, id: keyof T | { id: string }) => void) => void) |  ((task: T, cb: (error: any, id: keyof T) => void) => void) // used to uniquely identify the items in queue
  id?: (msg: IMsg) => string; // used to uniquely identify the items in queue
  // filterQueue?: (msg: T) => boolean | Promise<boolean> // Used to conditionally filter what messages are allowed to enter the queue. Return true to pass the message through to the queue, false to drop it. If undefined, then all messages are allowed.
  // precondition?: (cb: (error: unknown, passOrFail: boolean) => void) => void
  // preconditionRetryTimeout?: number // Number of milliseconds to delay before checking the precondition function again. Defaults to 10x1000 = 10 seconds.
  // onEvents?: [
  //   event: QueueEvents,
  //   listener: (id: string, queueId: string | number, error?: string) => void
  // ][]
  // TODO: implement store config for the queue
  // storage?: StoreConfig
  concurrent?: number; // Allows more than one message to be processed assynchronously if > 1. Defaults to 1.
  maxTimeout?: number; // Number of milliseconds before a task is considered timed out. Defaults to 10x1000 = 10 seconds
  // TODO: implement another delay option for after the process is complete before the next message is processed
  afterProcessDelay?: number; // Number of ms to to interval loop the worker checking for completion of process to begin next. Defaults to 1x1000 = 1 second.
  rotate?: boolean; // Rotate the queue moving a failed message to the end of the queu. Defaults to false
  verbose?: boolean; // Log messages to console. Defaults to false
  store: 'file' | 'memory';
  msgType?: MsgTypes; // defaults to HL7v2
  stringify?: (msg: IMsg) => string;
  parse?: (msg: string) => IMsg;
}

export type TcpConfig<T extends 'I' | 'O' = 'I'> = T extends 'I'
  ? ITcpConfig
  : ITcpConfig<true> & {
      responseTimeout?: number | false;
    };

export type HTTPConfig<T extends 'I' | 'O' = 'I'> = T extends 'I'
  ? IHTTPConfig
  : IHTTPConfig<true> & {
      responseTimeout?: number | false;
    };

export type HTTPSConfig<T extends 'I' | 'O' = 'I'> = T extends 'I'
  ? IHTTPSConfig
  : IHTTPSConfig<true> & {
      responseTimeout?: number | false;
    };

interface IFileConfig {
  directory: string;
  ftp?: string;
  sftp?: string;
  filenamePattern?: string;
  includeAllSubDirs?: boolean;
  ignoreDotFiles?: boolean;
  username?: boolean;
  password?: boolean;
  timeout?: number;
  deleteAfterRead?: boolean;
  moveAfterRead?: {
    directory: string;
    filename: string;
  };
  moveAfterError?: {
    directory: string;
    filename: string;
  };
  checkFileAge?: number;
  limitSize?: RequireAtLeastOne<{
    min?: number;
    max?: number;
  }>;
}

export type FileConfig = RequireExactlyOne<
  IFileConfig,
  'ftp' | 'sftp' | 'directory'
>;

export type TCPConnection<T extends 'I' | 'O'> = T extends 'I'
  ? { queue?: QueueConfig; kind: 'tcp'; tcp: TcpConfig<T> }
  : { kind: 'tcp'; tcp: TcpConfig<T> };

export type HTTPConnection<T extends 'I' | 'O'> = T extends 'I'
  ? { queue?: QueueConfig; kind: 'http'; http: HTTPConfig<T> }
  : { kind: 'http'; http: HTTPConfig<T> };

export type HTTPSConnection<T extends 'I' | 'O'> = T extends 'I'
  ? { queue?: QueueConfig; kind: 'https'; https: HTTPSConfig<T> }
  : { kind: 'https'; https: HTTPSConfig<T> };

// NOTE: if new kind is added, adjust the isConnectionFlow type guard
export type Connection<T extends 'I' | 'O'> =
  | TCPConnection<T>
  | HTTPConnection<T>
  | HTTPSConnection<T>;
// TODO: implement file reader source
// NOTE: file source is different than the `file` store, because it will support additional methods such as ftp/sftp
// | FileConnection<T>
// | FTPConnection<T>
// | SFTPConnection<T>
//  TODO: implement db query source
// NOTE: db source should be different than the `StoreConfig` because it should support query conditions. TBD
// | DBConnection<T>

export const isTCPConnection = <T extends 'I' | 'O'>(
  conn: Connection<T>,
): conn is TCPConnection<T> => conn.kind === 'tcp';

export const isHTTPConnection = <T extends 'I' | 'O'>(
  conn: Connection<T>,
): conn is HTTPConnection<T> => conn.kind === 'http';

export const isHTTPSConnection = <T extends 'I' | 'O'>(
  conn: Connection<T>,
): conn is HTTPSConnection<T> => conn.kind === 'https';

export type AckConfig = {
  // Value to use in ACK MSH.3
  application?: string; // defaults to "gofor Engine"
  // Value to use in ACK MSH.4
  organization?: string; // defaults to empty string ""
  responseCode?:
    | 'AA' // Application Accept. Default
    | 'AE' // Application Error
    | 'AR'; // Application Reject
  // A Store configuration to save persistent messages
  text?: string; // Text to use in ACK MSA.3
  msg?: (ack: IMsg, msg: IMsg, context: IAckContext) => IMsg; // returns the ack message to send
};

export interface Tag {
  name: string;
  color?: string; // a valid hexidecimal color string or valid CSS color name
}

export type FilterFunc = (msg: IMsg, context: IMessageContext) => boolean;
export type MsgVFunc<V> = (msg: IMsg, context: IMessageContext) => V;

// Returns true to pass through. Return false to filter out.
// O = require objectified filters
// F = require raw function filters
// B = allow either objectified or raw function filters
export type FilterFlow<Filt extends 'O' | 'F' | 'B' = 'B'> = Filt extends 'O'
  ? { kind: 'filter'; filter: FilterFunc }
  : Filt extends 'F'
  ? FilterFunc
  : FilterFunc | { kind: 'filter'; filter: FilterFunc };

type TransformFunc = (msg: IMsg, context: IMessageContext) => IMsg;

// O = require objectified transformers
// F = require raw function transformers
// B = allow either objectified or raw function transformers
export type TransformFlow<Tran extends 'O' | 'F' | 'B' = 'B'> = Tran extends 'O'
  ? { kind: 'transform'; transform: TransformFunc }
  : Tran extends 'F'
  ? TransformFunc
  : TransformFunc | { kind: 'transform'; transform: TransformFunc };

// This is a function that can be used as a filter or transformer
// If it returns false it will filter out the message
// Otherwise it returns the transformed message
type TransformFilterFunction = (
  msg: IMsg,
  context: IMessageContext,
) => false | IMsg;

export type TransformOrFilterFlow<Tran extends 'O' | 'F' | 'B' = 'B'> =
  Tran extends 'O'
    ? { kind: 'transformFilter'; transformFilter: TransformFilterFunction }
    : Tran extends 'F'
    ? TransformFilterFunction
    :
        | TransformFilterFunction
        | { kind: 'transformFilter'; transformFilter: TransformFilterFunction };

// O = require objectified filters/transformers
// F = require raw function filters/transformers
// B = allow either objectified or raw function filters/transformers
export type IngestionFlow<
  Filt extends 'O' | 'F' | 'B' = 'B',
  Tran extends 'O' | 'F' | 'B' = 'B',
> =
  | { kind: 'ack'; ack: AckConfig }
  | FilterFlow<Filt>
  | TransformFlow<Tran>
  | TransformOrFilterFlow<Tran>
  | ({ kind: 'store' } & StoreConfig);

// O = require objectified filters/transformers
// F = require raw function filters/transformers
// B = allow either objectified or raw function filters/transformers
export type Ingestion<
  Filt extends 'O' | 'F' | 'B' = 'B',
  Tran extends 'O' | 'F' | 'B' = 'B',
> = {
  kind: 'flow';
  id?: string | number; // a unique id for this ingestion flow. If not provided will use UUID to generate. if not defined it may not be the same between deployments/reboots
  name?: string; // a human readable name for this ingestion flow. Preferrably unique
  tags?: Tag[]; // Tags to help organize/identify ingestion flows
  queue?: QueueConfig;
  flow: IngestionFlow<Filt, Tran>;
};

export type StoreConfigFlow = { kind: 'store' } & StoreConfig;

// O = require objectified filters/transformers
// F = require raw function filters/transformers
// B = allow either objectified or raw function filters/transformers
export type RouteFlow<
  Filt extends 'O' | 'F' | 'B' = 'B',
  Tran extends 'O' | 'F' | 'B' = 'B',
> =
  | FilterFlow<Filt>
  | TransformFlow<Tran>
  | TransformOrFilterFlow<Tran>
  | StoreConfigFlow
  | Connection<'O'>;

export const isFilterFlow = <
  Filt extends 'O' | 'F' | 'B' = 'B',
  Tran extends 'O' | 'F' | 'B' = 'B',
>(
  flow: RouteFlow<Filt, Tran>,
): flow is FilterFlow<Filt> => {
  if (typeof flow === 'object') {
    return flow.kind === 'filter';
  }
  return false;
};

export const isTransformFlow = <
  Filt extends 'O' | 'F' | 'B' = 'B',
  Tran extends 'O' | 'F' | 'B' = 'B',
>(
  flow: RouteFlow<Filt, Tran>,
): flow is TransformFlow<Tran> => {
  if (typeof flow === 'object') {
    return flow.kind === 'transform';
  }
  return false;
};

export const isStoreConfigFlow = <
  Filt extends 'O' | 'F' | 'B' = 'B',
  Tran extends 'O' | 'F' | 'B' = 'B',
>(
  flow: RouteFlow<Filt, Tran>,
): flow is StoreConfigFlow => {
  if (typeof flow === 'object') {
    return flow.kind === 'store';
  }
  return false;
};

export const isConnectionFlow = <
  Filt extends 'O' | 'F' | 'B' = 'B',
  Tran extends 'O' | 'F' | 'B' = 'B',
>(
  flow: RouteFlow<Filt, Tran>,
): flow is Connection<'O'> => {
  if (typeof flow === 'object') {
    return flow.kind === 'tcp' || flow.kind === 'http' || flow.kind === 'https';
  }
  return false;
};

export const isTransformOrFilterFlow = <
  Filt extends 'O' | 'F' | 'B' = 'B',
  Tran extends 'O' | 'F' | 'B' = 'B',
>(
  flow: RouteFlow<Filt, Tran>,
): flow is TransformOrFilterFlow<Tran> => {
  if (typeof flow === 'function') {
    return true;
  }
  if (typeof flow === 'object') {
    return flow.kind === 'transformFilter';
  }
  return false;
};

// O = require objectified filters/transformers
// F = require raw function filters/transformers
// B = allow either objectified or raw function filters/transformers
export type RouteFlowNamed<
  Filt extends 'O' | 'F' | 'B' = 'B',
  Tran extends 'O' | 'F' | 'B' = 'B',
> = {
  kind: 'flow';
  id?: string | number; // a unique id for this route flow. If not provided will use UUID to generate. if not defined it may not be the same between deployments/reboots
  name?: string; // a human readable name for this route flow. Preferrably unique
  tags?: Tag[]; // Tags to help organize/identify route flows
  queue?: QueueConfig;
  flow: RouteFlow<Filt, Tran>;
};

// O = require objectified filters/transformers
// F = require raw function filters/transformers
// B = allow either objectified or raw function filters/transformers
// Stct = strict mode. If 'S' then everything must be objectified with ids. If 'L' then allow loose.
export type Route<
  Filt extends 'O' | 'F' | 'B' = 'B',
  Tran extends 'O' | 'F' | 'B' = 'B',
  Stct extends 'S' | 'L' = 'L',
> = {
  kind: 'route';
  id?: string | number; // a unique id for this route flow. If not provided will use UUID to generate. if not defined it may not be the same between deployments/reboots
  name?: string; // a human readable name for this route flow. Preferrably unique
  tags?: Tag[]; // Tags to help organize/identify route flows
  queue?: QueueConfig;
  flows: Stct extends 'S'
    ? SetRequired<RouteFlowNamed<Filt, Tran>, 'id'>[]
    : (RouteFlow<Filt, Tran> | RouteFlowNamed<Filt, Tran>)[];
};

// Filt(er) & Tran(sformer)
// O = require objectified filters/transformers
// F = require raw function filters/transformers
// B = allow either objectified or raw function filters/transformers
// Stct = strict mode. If 'S' then everything must be objectified with ids. If 'L' then allow loose.
export type ChannelConfig<
  Filt extends 'O' | 'F' | 'B' = 'B',
  Tran extends 'O' | 'F' | 'B' = 'B',
  Stct extends 'S' | 'L' = 'L',
> = SetRequired<
  {
    id?: string | number; // a unique id for this channel. If not provided will use UUID to generate. if not defined it may not be the same between deployments/reboots
    name: string; // a name, preferrably unique, to identify this channel later on
    tags?: Tag[]; // Tags to help organize/identify channels
    source: Connection<'I'>;
    ingestion: Stct extends 'S'
      ? SetRequired<Ingestion<Filt, Tran>, 'id' | 'flow'>[]
      : (IngestionFlow<Filt, Tran> | Ingestion<Filt, Tran>)[];
    routes?: Stct extends 'S'
      ? SetRequired<Route<Filt, Tran, 'S'>, 'id' | 'flows'>[]
      : (
          | (RouteFlow<Filt, Tran> | RouteFlowNamed<Filt, Tran>)[]
          | Route<Filt, Tran>
        )[];
    logLevel?: TLogLevel; // the log level for this channel. If not provided will not log anything.
  },
  Stct extends 'S' ? 'id' : 'name'
>; // `name` here is just a placholder for default. It doesn't change anything because name is already a required field.

export type InitServers = <
  Filt extends 'O' | 'F' | 'B' = 'B',
  Tran extends 'O' | 'F' | 'B' = 'B',
>(
  channels: ChannelConfig<Filt, Tran, 'S'>[],
) => void;

export type AckFunc = (ack: IMsg, context: IMessageContext) => void;

export type IngestFunc = <
  Filt extends 'O' | 'F' | 'B' = 'B',
  Tran extends 'O' | 'F' | 'B' = 'B',
>(
  channel: ChannelConfig<Filt, Tran, 'S'>,
  msg: IMsg,
  ack: AckFunc | undefined,
  context: IMessageContext,
) => IMsg | false;

export type IngestMsgFunc = (
  msg: IMsg,
  ack: AckFunc | undefined,
  context: IMessageContext,
) => Promise<boolean>;

export type RunRoutesFunc = <
  Filt extends 'O' | 'F' | 'B' = 'B',
  Tran extends 'O' | 'F' | 'B' = 'B',
>(
  channel: ChannelConfig<Filt, Tran, 'S'>,
  msg: IMsg,
  context: IMessageContext,
  // direct provides a way to bypass non-existent event handlers. This is used for direct calls to routes such as the messenger.
  direct?: boolean,
) => Promise<boolean>;

export type RunRouteFunc = <
  Filt extends 'O' | 'F' | 'B' = 'B',
  Tran extends 'O' | 'F' | 'B' = 'B',
>(
  channelId: string | number,
  routeId: string | number,
  route: SetRequired<RouteFlowNamed<Filt, Tran>, 'id'>[],
  msg: IMsg,
  context: IMessageContext,
  // direct provides a way to bypass non-existent event handlers. This is used for direct calls to routes such as the messenger.
  direct?: boolean,
  callback?: (msg: IMsg) => void,
) => Promise<boolean>;

export interface OGofer {
  run: (channels: ChannelConfig) => string | number | undefined;
  configs: (channels: ChannelConfig[]) => void;
  listen(method: 'tcp', host: string, port: number): OIngest;
  listen(method: 'http', options: IHTTPConfig): OIngest;
  listen(method: 'https', options: IHTTPSConfig): OIngest;
  // files: (config: FileConfig) => OIngest
  // msg: (msg: Msg) => OIngest
  messenger: Messenger;
}

export type MsgVar<V> = V | ((msg: IMsg, context?: IMessageContext) => V);
export type WithVarDo<V> = (
  v: V | undefined,
  msg: IMsg,
  context: IMessageContext,
) => void | IMsg | boolean;

// TODO: implement cron schedule

// type DayOfWeek = 'SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT'
// export interface ICronSchedule { // default is every hour on the hour
//   second?: number | '*' // 0-59|* (optional, default '0')
//   minute?: number | '*' // 0-59|* (optional, default '0')
//   hour?: number | '*' // 0-23|* (optional, default '*')
//   dayOfMonth?: number | '*' // 1-31|* (optional, default '*')
//   month?: number | '*' // 1-12|* (optional, default '*')
//   dayOfWeek?: DayOfWeek[] | '*' // 0-7|* (optional, default '*')
//   year?: number | '*' // 1970-2999|* (optional, default '*')
// }

export interface OComplete {
  run: () => string | number | undefined;
  // TODO: implement one time run
  // once: (when?: Date) => void
  // TODO: implement cron scheduled runs
  // schedule: (schedule: ICronSchedule) => void
  export: () => ChannelConfig<'B', 'B', 'S'>;
  msg: (cb: (msg: IMsg, context: IMessageContext) => void) => void;
}

export interface OBase<O> {
  name: (name: string) => O;
  id: (id: string | number) => O;
  filter: (f: FilterFlow<'F'>) => O;
  transform: (t: TransformFlow<'F'>) => O;
  // filterOrTransform: (ft: TransformFilterFlow<'F>) => O
  store: (s: StoreConfig) => O;
  setMsgVar: <V>(varName: string, varValue: MsgVar<V>) => O;
  setChannelVar: <V>(varName: string, varValue: MsgVar<V>) => O;
  setGlobalVar: <V>(varName: string, varValue: MsgVar<V>) => O;
  getMsgVar: <V>(varName: string, getVal: WithVarDo<V>) => O;
  getChannelVar: <V>(varName: string, getVal: WithVarDo<V>) => O;
  getGlobalVar: <V>(varName: string, getVal: WithVarDo<V>) => O;
}

export interface OIngest extends OComplete, OBase<OIngest> {
  logLevel: (level: TLogLevel) => OIngest;
  setVar: <V>(
    scope: Exclude<varTypes, 'Route'>,
    varName: string,
    varValue: MsgVar<V>,
  ) => OIngest;
  getVar: <V>(
    scope: Exclude<varTypes, 'Route'>,
    varName: string,
    getVal: WithVarDo<V>,
  ) => OIngest;
  ack: (ack?: AckConfig) => OIngest;
  route: (r: (route: ORoute) => ORoute) => OComplete;
  routes: (r: (route: () => ORoute) => ORoute[]) => OComplete;
}

export interface ORoute extends OBase<ORoute> {
  setVar: <V>(scope: varTypes, varName: string, varValue: MsgVar<V>) => ORoute;
  getVar: <V>(scope: varTypes, varName: string, getVal: WithVarDo<V>) => ORoute;
  setRouteVar: <V>(varName: string, varValue: MsgVar<V>) => ORoute;
  getRouteVar: <V>(varName: string, getVal: WithVarDo<V>) => ORoute;
  send(method: 'tcp', host: FunctProp<string>, port: FunctProp<number>): ORoute;
  send(method: 'http', options: IHTTPConfig<true>): ORoute;
  send(method: 'https', options: IHTTPSConfig<true>): ORoute;
  export: () => SetRequired<Route<'F', 'F', 'S'>, 'id' | 'flows'>;
}

export type MessengerRoute = (
  R: Exclude<ORoute, 'export'>,
) => Exclude<ORoute, 'export'>;
export type MessengerInput = IMsg extends HL7v2
  ? string | HL7v2 | ((msg: HL7v2) => HL7v2) | Message | StrictMessage
  : IMsg extends JSONMsg
  ? string | JSONValue
  : string | IMsg | ((msg: IMsg) => IMsg);

export type MessengerFunc = (msg: MessengerInput) => Promise<IMsg>;
export type Messenger = (
  route: MessengerRoute,
) => [messenger: MessengerFunc, messengerId: string];
