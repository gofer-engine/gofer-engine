import { StoreConfig } from '@gofer-engine/stores';
import handelse from '@gofer-engine/handelse';
import { doAck } from './doAck';
import { mapOptions } from './helpers';
import { store } from './initStores';
import { queue } from './queue';
import { tcpClient } from './tcpClient';
import { Connection, RunRouteFunc, RunRoutesFunc } from './types';
import { getRouteVar, setRouteVar } from './variables';
import { doFilterTransform } from './doFilterTransform';

export const runRoutes: RunRoutesFunc = async (
  channel,
  msg,
  context,
  direct,
) => {
  const routes = channel?.routes ?? [];
  return Promise.all(
    routes?.map((route) => {
      context.routeId = route.id;
      context.getRouteVar = getRouteVar(route.id);
      context.setRouteVar = setRouteVar(route.id);
      if (route.queue) {
        const options = mapOptions(route.queue);
        return new Promise<boolean>((res) => {
          queue(
            `${channel.id}.route.${route.id}`,
            (msg) => {
              return new Promise((res) => {
                runRoute(channel.id, route.id, route.flows, msg, context)
                  .then(() => {
                    // no matter if the message is filtered or not return true that the message was processed.
                    res(true);
                  })
                  .catch((error: unknown) => {
                    handelse.go(
                      `gofer:${channel.id}.onError`,
                      {
                        error: error,
                        channe: channel.id,
                        route: route.id,
                      },
                      {
                        createIfNotExists: direct,
                      },
                    );
                    res(false);
                  });
              });
            },
            msg,
            options,
          );
          return res(true);
        });
      }
      return runRoute(channel.id, route.id, route.flows, msg, context, direct);
    }) || [],
  ).then((res) => !res.some((r) => !r));
};

export const runRoute: RunRouteFunc = async (
  channelId,
  routeId,
  route,
  msg,
  context,
  direct,
  callback,
) => {
  handelse.go(
    `gofer:${channelId}.onRouteStart`,
    {
      msg,
      channel: channelId.toString(),
      route: route.toString(),
    },
    {
      createIfNotExists: direct,
    },
  );
  let filtered = false;
  let flows: (boolean | Promise<boolean>)[] = [];

  for (const namedFlow of route) {
    const flow = namedFlow.flow;
    if (filtered) return false;
    if (typeof flow === 'function') {
      const filterFlows = doFilterTransform(
        msg,
        flow,
        namedFlow.id,
        context,
        flows,
        filtered,
        direct,
      );
      filtered = filterFlows.filtered;
      flows = filterFlows.flows;
      msg = filterFlows.msg;
      continue;
    }
    if (typeof flow === 'object') {
      if (flow.kind === 'filter') {
        const filterFlows = doFilterTransform(
          msg,
          flow.filter,
          namedFlow.id,
          context,
          flows,
          filtered,
          direct,
        );
        filtered = filterFlows.filtered;
        flows = filterFlows.flows;
        msg = filterFlows.msg;
        continue;
      }
      if (flow.kind === 'transform') {
        const filterFlows = doFilterTransform(
          msg,
          flow.transform,
          namedFlow.id,
          context,
          flows,
          filtered,
          direct,
        );
        filtered = filterFlows.filtered;
        flows = filterFlows.flows;
        msg = filterFlows.msg;
        continue;
      }
      if (flow.kind === 'transformFilter') {
        const filterFlows = doFilterTransform(
          msg,
          flow.transformFilter,
          namedFlow.id,
          context,
          flows,
          filtered,
          direct,
        );
        filtered = filterFlows.filtered;
        flows = filterFlows.flows;
        msg = filterFlows.msg;
        continue;
      }
      if (flow.kind === 'tcp') {
        const { tcp: tcpConfig } = flow as Connection<'O'>;
        handelse.go(
          `gofer:${channelId}.onLog`,
          {
            log: `tcpConfig: ${JSON.stringify(tcpConfig)}`,
            channel: channelId,
            route: routeId,
            flow: namedFlow.id,
          },
          {
            createIfNotExists: direct,
          },
        );
        if (namedFlow.queue) {
          const queueConfig = namedFlow.queue;
          /**
           * NOTE: Since we are using a queue, we can't use the tcpClient response to set
           * the msg. We need to use the queue's response to set the msg.
           */
          flows.push(
            new Promise<boolean>((res) => {
              queue(
                `${channelId}.${namedFlow.id}.tcp`,
                (msg) =>
                  tcpClient(
                    tcpConfig,
                    msg,
                    undefined,
                    undefined,
                    channelId,
                    routeId,
                    namedFlow.id,
                    context,
                  )
                    .then(() => true)
                    .catch(() => false),
                msg,
                mapOptions(queueConfig),
              );
              return res(true);
            }),
          );
          // set the msg to a dummy ack message so that the next flow can use it.
          msg = doAck(
            msg,
            { text: 'Queued' },
            { channelId, routeId, flowId: namedFlow.id },
            context,
          );
          continue;
        }
        msg = await tcpClient(
          tcpConfig,
          msg,
          undefined,
          undefined,
          channelId,
          routeId,
          namedFlow.id,
          context,
          direct,
        );
        flows.push(true);
        continue;
      }
      if (flow.kind === 'store') {
        const storeConfig = { ...flow } as StoreConfig & { kind?: 'store' };
        delete storeConfig.kind;
        flows.push(store(storeConfig as StoreConfig, msg) ?? false);
        continue;
      }
    }
    handelse.go(
      `gofer:${channelId}.onError`,
      {
        error: 'unknown flow type not yet implemented',
        channel: channelId,
        flow: namedFlow.id.toString(),
        route: routeId,
      },
      {
        createIfNotExists: direct,
      },
    );
    return false;
  }
  return Promise.all(flows).then((res) => {
    const status = !res.some((r) => !r);
    handelse.go(
      `gofer:${channelId}.onRouteEnd`,
      {
        msg,
        channel: channelId.toString(),
        route: route.toString(),
        status,
      },
      {
        createIfNotExists: direct,
      },
    );
    if (status && typeof callback === 'function') {
      callback(msg);
    }
    return status;
  });
};
