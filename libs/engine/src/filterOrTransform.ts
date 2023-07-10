import { IMsg } from '@gofer-engine/hl7'
import handelse from '@gofer-engine/handelse'
import { IMessageContext } from './types'
import { logger } from './helpers'

export const filterOrTransform = <T = IMsg>(
  msg: T,
  filtered: boolean,
  flow: (msg: T, context: IMessageContext) => T | boolean,
  channelId: string | number,
  flowId: string | number,
  route: string | number | undefined,
  context: IMessageContext
): [T, boolean] => {
  if (filtered) return [msg, filtered]
  context.logger = logger({
    channelId,
    flowId,
    msg,
  })
  const filteredOrMsg = flow(msg, context)
  if (typeof filteredOrMsg === 'boolean') {
    if (!filteredOrMsg) {
      handelse.go(`gofer:${channelId}.onFilter`, {
        msg,
        channel: channelId,
        flow: flowId,
        route,
      })
    }
    filtered = !filteredOrMsg
  } else {
    handelse.go(`gofer:${channelId}.onTransform`, {
      pre: msg,
      post: filteredOrMsg,
      channel: channelId,
      flow: flowId,
      route,
    })
    msg = filteredOrMsg
  }
  return [msg, filtered]
}
