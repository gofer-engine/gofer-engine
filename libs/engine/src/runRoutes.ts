import { StoreConfig } from '@gofer-engine/stores'
import handelse from '@gofer-engine/handelse'
import Msg from '@gofer-engine/ts-hl7'
import { doAck } from './doAck'
import { logger, mapOptions } from './helpers'
import { store } from './initStores'
import { queue } from './queue'
import { tcpClient } from './tcpClient'
import {
  Connection,
  IMessageContext,
  RunRouteFunc,
  RunRoutesFunc,
} from './types'
import { getRouteVar, setRouteVar } from './variables'

export const runRoutes: RunRoutesFunc = async (channel, msg, context) => {
  const routes = channel?.routes ?? []
  return Promise.all(
    routes?.map((route) => {
      context.routeId = route.id
      context.getRouteVar = getRouteVar(route.id)
      context.setRouteVar = setRouteVar(route.id)
      if (route.queue) {
        const options = mapOptions(route.queue)
        return new Promise<boolean>((res) => {
          queue(
            `${channel.id}.route.${route.id}`,
            (msg) => {
              return new Promise((res) => {
                runRoute(channel.id, route.id, route.flows, msg, context)
                  .then(() => {
                    // no matter if the message is filtered or not return true that the message was processed.
                    res(true)
                  })
                  .catch((error: unknown) => {
                    handelse.go(`gofer:${channel.id}.onError`, {
                      error: error,
                      channe: channel.id,
                      route: route.id,
                    })
                    res(false)
                  })
              })
            },
            msg,
            options
          )
          return res(true)
        })
      }
      return runRoute(channel.id, route.id, route.flows, msg, context)
    }) || []
  ).then((res) => !res.some((r) => !r))
}

export const runRoute: RunRouteFunc = async (
  channelId,
  routeId,
  route,
  msg,
  context
) => {
  handelse.go(`gofer:${channelId}.onRouteStart`, {
    msg,
    channel: channelId.toString(),
    route: route.toString(),
  })
  let filtered = false
  const flows: (boolean | Promise<boolean>)[] = []
  const doFilterTransform = (
    msg: Msg,
    flow: (msg: Msg, context: IMessageContext) => boolean | Msg,
    flowId: string | number
  ) => {
    context.logger = logger({
      channelId,
      routeId,
      flowId,
      msg,
    })
    const filterOrTransform = flow(msg, context)
    if (typeof filterOrTransform === 'boolean') {
      if (!filterOrTransform)
        handelse.go(`gofer:${channelId}.onFilter`, {
          msg,
          channel: channelId,
          route: routeId,
          flow: flowId,
        })
      filtered = !filterOrTransform
      flows.push(true)
    } else {
      handelse.go(`gofer:${channelId}.onTransform`, {
        pre: msg,
        post: filterOrTransform,
        channel: channelId,
        route: routeId,
        flow: flowId,
      })
    }
  }
  for (const namedFlow of route) {
    const flow = namedFlow.flow
    if (filtered) return false
    if (typeof flow === 'function') {
      doFilterTransform(msg, flow, namedFlow.id)
      continue
    }
    if (typeof flow === 'object') {
      if (flow.kind === 'filter') {
        doFilterTransform(msg, flow.filter, namedFlow.id)
        continue
      }
      if (flow.kind === 'transform') {
        doFilterTransform(msg, flow.transform, namedFlow.id)
        continue
      }
      if (flow.kind === 'transformFilter') {
        doFilterTransform(msg, flow.transformFilter, namedFlow.id)
        continue
      }
      if (flow.kind === 'tcp') {
        const { tcp: tcpConfig } = flow as Connection<'O'>
        handelse.go(`gofer:${channelId}.onLog`, {
          log: `tcpConfig: ${JSON.stringify(tcpConfig)}`,
          channel: channelId,
          route: routeId,
          flow: namedFlow.id,
        })
        if (namedFlow.queue) {
          const queueConfig = namedFlow.queue
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
                    context
                  )
                    .then(() => true)
                    .catch(() => false),
                msg,
                mapOptions(queueConfig)
              )
              return res(true)
            })
          )
          // set the msg to a dummy ack message so that the next flow can use it.
          msg = doAck(
            msg,
            { text: 'Queued' },
            { channelId, routeId, flowId: namedFlow.id },
            context
          )
          continue
        }
        msg = await tcpClient(
          tcpConfig,
          msg,
          undefined,
          undefined,
          channelId,
          routeId,
          namedFlow.id,
          context
        )
        flows.push(true)
        continue
      }
      if (flow.kind === 'store') {
        const storeConfig = { ...flow } as StoreConfig & { kind?: 'store' }
        delete storeConfig.kind
        flows.push(store(storeConfig as StoreConfig, msg) ?? false)
        continue
      }
    }
    handelse.go(`gofer:${channelId}.onError`, {
      error: 'unknown flow type not yet implemented',
      channel: channelId,
      flow: namedFlow.id.toString(),
      route: routeId,
    })
    return false
  }
  return Promise.all(flows).then((res) => {
    const status = !res.some((r) => !r)
    handelse.go(`gofer:${channelId}.onRouteEnd`, {
      msg,
      channel: channelId.toString(),
      route: route.toString(),
      status,
    })
    return status
  })
}
