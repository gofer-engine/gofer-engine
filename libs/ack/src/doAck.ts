import { AckConfig, GetMsgType, IMessageContext, IMsg } from '@gofer-engine/message-type'
import { logger } from "@gofer-engine/logger";

export const doAck = (
  msg: IMsg,
  ackConfig: AckConfig = {},
  {
    filtered = false,
    channelId,
    routeId,
    flowId,
  }: {
    filtered?: boolean;
    channelId: string | number;
    routeId?: string | number;
    flowId?: string | number;
  },
  context: IMessageContext,
  getMsgType: GetMsgType,
) => {
  const msgType = context.kind
  const app = ackConfig.application ?? 'gofer ENGINE';
  const org = ackConfig.organization ?? '';
  const res = ackConfig.responseCode ?? 'AA';
  const txt = ackConfig.text ?? '';
  // FIXME: this will only work for HL7v2 messages. Need to add support for XML, JSON, etc.
  const id = msg.get('MSH-10.1');
  const now = new Date()
    .toUTCString()
    .replace(/[^0-9]/g, '')
    .slice(0, -3);
  let ackMsg: IMsg
  if (msgType === 'JSON') {
    ackMsg = getMsgType(
      msgType,
      {
        ...{
          id,
          org: org === '' ? undefined : org,
          res: txt === '' || res === 'AE' ? undefined : txt,
          error: res === 'AE' ? txt ?? 'Unknown Error' : undefined,
        },
        accepted: res === 'AA',
        app,
        datetime: new Date().toISOString(),
      }
    );
  } else {
    ackMsg = getMsgType(
      msgType,
      `MSH|^~\\&|${app}|${org}|||${now}||ACK|${id}|P|2.5.1|\nMSA|${res}|${id}${
        txt ? `|${txt}` : ''
      }`,
    );
  }
  if (typeof ackConfig.msg === 'function') {
    context.logger = logger({
      channelId,
      routeId,
      flowId,
      msg,
    });
    ackMsg = ackConfig.msg(ackMsg, msg, { ...context, filtered });
  }
  return ackMsg;
};
