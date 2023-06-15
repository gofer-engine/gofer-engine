import Msg from '@gofer-engine/ts-hl7'
import { AckConfig, IMessageContext } from './types'
import { logger } from './helpers'

export const doAck = (
  msg: Msg,
  ackConfig: AckConfig = {},
  {
    filtered = false,
    channelId,
    routeId,
    flowId,
  }: {
    filtered?: boolean
    channelId: string | number
    routeId?: string | number
    flowId?: string | number
  },
  context: IMessageContext
) => {
  const app = ackConfig.application ?? 'gofer ENGINE'
  const org = ackConfig.organization ?? ''
  const res = ackConfig.responseCode ?? 'AA'
  const txt = ackConfig.text ?? ''
  const id = msg.get('MSH-10.1')
  const now = new Date()
    .toUTCString()
    .replace(/[^0-9]/g, '')
    .slice(0, -3)
  let ackMsg = new Msg(
    `MSH|^~\\&|${app}|${org}|||${now}||ACK|${id}|P|2.5.1|\nMSA|${res}|${id}${
      txt ? `|${txt}` : ''
    }`
  )
  if (typeof ackConfig.msg === 'function') {
    context.logger = logger({
      channelId,
      routeId,
      flowId,
      msg,
    })
    ackMsg = ackConfig.msg(ackMsg, msg, { ...context, filtered })
  }
  return ackMsg
}
