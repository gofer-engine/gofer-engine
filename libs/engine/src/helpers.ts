import { IMessageContext, IMsg, MsgTypes, TLogLevel } from '@gofer-engine/message-type';
import HL7v2Msg from '@gofer-engine/hl7';
import JSONMsg from '@gofer-engine/json';
import handelse from '@gofer-engine/handelse';
import { IQueueOptions } from '@gofer-engine/queue';
import { publishers } from './eventHandlers';
import { genId } from './genId';
import {
  ChannelConfig,
  Ingestion,
  IngestionFlow,
  QueueConfig,
  Route,
  RouteFlow,
  RouteFlowNamed,
} from './types';
import { Promisable } from 'type-fest';

export const isLogging = (logLevel: TLogLevel, logConfigLevel?: TLogLevel) => {
  if (logConfigLevel === undefined) return true;
  const levels = ['error', 'warn', 'info', 'debug'];
  const logLevelIndex = levels.indexOf(logLevel);
  const logConfigLevelIndex = levels.indexOf(logConfigLevel);
  return logLevelIndex <= logConfigLevelIndex;
};

type TLoggerArgs<T> = {
  channelId: string | number;
  routeId?: string | number;
  flowId?: string | number;
  readonly msg?: T;
};
export const logger =
  <T>({ channelId, flowId, msg }: TLoggerArgs<T>) =>
  (log: string, logLevel?: TLogLevel) =>
    handelse.go(`gofer:${channelId}.onLog`, {
      msg,
      log,
      channel: channelId,
      flow: flowId,
      level: logLevel,
    });

// this function modifies the original channel object to prevent generating new ids on every call
export const ingestionObjectify = (channel: ChannelConfig) => {
  channel.ingestion = channel.ingestion.map((flow) => {
    if (typeof flow === 'object' && flow.kind === 'flow') {
      if (flow?.id === undefined) {
        const ingestionId = genId();
        if (isLogging('warn', channel.logLevel))
          publishers.onLog(
            `Channel ${channel.name} (${channel.id}) had an ingestion flow without an id. Generated id: ${ingestionId}`,
          );
        flow.id = ingestionId;
      }
      return flow;
    }
    const ingestionId = genId();
    if (isLogging('warn', channel.logLevel))
      publishers.onLog(
        `Channel ${channel.name} (${channel.id}) had an ingestion flow without an id. Generated id: ${ingestionId}`,
      );
    return {
      id: ingestionId,
      flow: flow as IngestionFlow,
    } as Ingestion;
  });
  return channel;
};

// this function does not modify the original channel object and returns only the ingestion flows
export const ingestionSimplify = <
  Filt extends 'O' | 'F' | 'B' = 'B',
  Tran extends 'O' | 'F' | 'B' = 'B',
>(
  channel: ChannelConfig<Filt, Tran, 'S' | 'L'>,
): IngestionFlow[] => {
  return channel.ingestion.map((flow) => {
    if (
      typeof flow === 'object' &&
      Object.prototype.hasOwnProperty.call(flow, 'flow')
    ) {
      return (flow as Ingestion).flow as IngestionFlow;
    }
    return flow as IngestionFlow;
  });
};

export const routeFlowObjectify = (
  flows: (RouteFlow<'B', 'B'> | RouteFlowNamed<'B', 'B'>)[],
  logLevel?: TLogLevel,
): RouteFlowNamed<'B', 'B'>[] => {
  return flows.map((flow) => {
    if (typeof flow === 'object' && flow.kind === 'flow') {
      flow = flow as RouteFlowNamed<'B', 'B'>;
      if (flow?.id === undefined) {
        const flowId = genId();
        if (isLogging('warn', logLevel))
          publishers.onLog(
            `Named Route (${flow.name}) was missing the id. Generated id: ${flowId}`,
          );
        flow.id = flowId;
      }
      return flow;
    }
    const flowId = genId();
    if (isLogging('warn', logLevel))
      publishers.onLog(`Route was missing the id. Generated id: ${flowId}`);
    return {
      kind: 'flow',
      id: flowId,
      flow: flow as RouteFlow<'B', 'B'>,
    };
  });
};

// this function modifies the original channel object to prevent generating new ids on every call
export const routesObjectify = (
  channel: ChannelConfig,
): ChannelConfig<'B', 'B', 'S'> => {
  channel.routes = channel.routes?.map((route) => {
    if (
      typeof route === 'object' &&
      !Array.isArray(route) &&
      route.kind === 'route'
    ) {
      if (route?.id === undefined) {
        const routeId = genId();
        if (isLogging('warn', channel.logLevel))
          publishers.onLog(
            `Channel ${channel.name} (${channel.id}) had an route without an id. Generated id: ${routeId}`,
          );
        route.id = routeId;
      }
      route.flows = routeFlowObjectify(route.flows, channel.logLevel);
      return route;
    }
    const routeId = genId();
    if (isLogging('warn', channel.logLevel))
      publishers.onLog(
        `Channel ${channel.name} (${channel.id}) had an route without an id. Generated id: ${routeId}`,
      );
    return {
      kind: 'route',
      id: routeId,
      flows: routeFlowObjectify(
        route as (RouteFlow | RouteFlowNamed)[],
        channel.logLevel,
      ),
    };
  });
  return channel as unknown as ChannelConfig<'B', 'B', 'S'>;
};

// this function does not modify the original channel object and returns only the routes
export const routesSimplify = (channel: ChannelConfig): RouteFlow[][] => {
  return (
    channel.routes?.map((route) => {
      if (
        typeof route === 'object' &&
        Object.prototype.hasOwnProperty.call(route, 'flows')
      ) {
        route = (route as Route).flows;
      }
      return (route as (RouteFlow | RouteFlowNamed)[]).map((flow) => {
        if (
          typeof flow === 'object' &&
          Object.prototype.hasOwnProperty.call(flow, 'flow')
        ) {
          return (flow as RouteFlowNamed).flow;
        }
        return flow as RouteFlow;
      });
    }) ?? []
  );
};

export const coerceStrictTypedChannels = (
  config: ChannelConfig<'B', 'B', 'L'>[],
): ChannelConfig<'B', 'B', 'S'>[] => {
  return config.map((channel) => {
    if (!channel.id) {
      channel.id = genId();
      if (isLogging('warn', channel.logLevel))
        publishers.onLog(
          `Channel "${channel.name}" config did not define an \`id\`. Assigned: "${channel.id}"`,
        );
    }
    // TODO: implement db source
    if (Object.prototype.hasOwnProperty.call(channel.source, 'db')) {
      publishers.onError(
        new Error(
          `Channel "${channel.name}"(${channel.id}) tried to use a \`db\` in the source. DB sources are not yet supported`,
        ),
      );
    }
    // TODO: implement file reader source
    if (Object.prototype.hasOwnProperty.call(channel.source, 'file')) {
      publishers.onError(
        new Error(
          `Channel "${channel.name}"(${channel.id}) tried to use a \`file\` in the source. File reader sources are not yet supported`,
        ),
      );
    }
    ingestionObjectify(channel);
    routesObjectify(channel);
    const stronglyTypedChannel = channel as ChannelConfig<'B', 'B', 'S'>;
    return stronglyTypedChannel;
  });
};
export const functionalVal = <
  T extends string | number | object | boolean | undefined,
>(
  val: T | ((msg: IMsg, context: IMessageContext) => T),
  msg: IMsg,
  context: IMessageContext,
): T => {
  if (typeof val === 'function') return val(msg, context);
  return val;
};

export const lastInArray = <T>(arr: T[]): T => {
  const l = arr.length;
  if (l < 1) throw Error('Cannot get the last item from an empty array.');
  return arr[l - 1];
};

export const promisify = <D>(data: Promisable<D>) =>
  new Promise<D>((res) => res(data));

export const allPass = (res: Record<string, boolean>) =>
  Object.values(res).every((v) => v);
export const atLeastOne = (res: Record<string, boolean>) =>
  Object.values(res).length > 0;
export const atLeastOnePass = (res: Record<string, boolean>) =>
  Object.values(res).some((v) => v);

export const mapOptions = (opt: QueueConfig): IQueueOptions<IMsg> => {
  return {
    filo: opt.filo,
    max_retries: opt.retries,
    max_timeout: opt.maxTimeout,
    workers: opt.concurrent,
    workerLoopInterval: opt.afterProcessDelay,
    store: opt.store,
    id: opt.id,
    allowUndefined: false,
    msgType: opt.msgType,
    storeStringify: (msg) => msg.toString(),
    storeParse: (msg) => getMsgType(opt.msgType ?? 'HL7v2', msg),
    verbose: opt.verbose,
  };
};

type MsgProps<T extends MsgTypes> = T extends 'HL7v2' 
  ?  ConstructorParameters<typeof HL7v2Msg>
  : T extends 'JSON'
    ? ConstructorParameters<typeof JSONMsg>
    : never;

export const getMsgType = <T extends MsgTypes>(
  msg: T, ...props: MsgProps<T>
): IMsg => {
  switch (msg) {
    case 'JSON':
      return new JSONMsg(...props as ConstructorParameters<typeof JSONMsg>);
    case 'HL7v2':
      return new HL7v2Msg(...props as ConstructorParameters<typeof HL7v2Msg>);
    default:
      throw new Error(`Unknown message type ${msg}`);
  }
};
