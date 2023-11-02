import { IMsg, isMsg } from '@gofer-engine/message-type';
import { msgIsHL7v2 } from '@gofer-engine/hl7';
import { MessengerFunc, MessengerRoute } from './types';
import { RouteClass } from './RouteClass';
import { runRoute } from './runRoutes';
import { getMsgType, logger } from './helpers';
import {
  getChannelVar,
  getGlobalVar,
  getMsgVar,
  setChannelVar,
  setGlobalVar,
  setMsgVar,
} from './variables';
import { genId } from './genId';
import { getMsgTypeFromFlows } from './getMsgTypeFromFlows';

const messengers = new Map<string, MessengerFunc>();

/**
 *
 * @param route
 * @returns `messenger` is a function that takes a message and sends it to the route. The message type is determined by the route's first connection flow.
 * @returns `id` is the id of the messenger
 */
export const messenger = (
  route: MessengerRoute,
): [messenger: MessengerFunc, id: string] => {
  const config = route(new RouteClass()).export();
  const flows = config.flows;
  const id = typeof config.id === 'number' ? config.id.toString() : config.id;
  const msgType = getMsgTypeFromFlows(flows);
  const func =
    messengers.get(id) ??
    ((msg) => {
      const message =
        typeof msg === 'function'
          ? msg(getMsgType(msgType))
          : isMsg(msg)
          ? msg
          : getMsgType(msgType, msg);
      let messageId: string;
      if (msgIsHL7v2(message)) {
        messageId = message.id() ?? genId('ID');
      } else {
        messageId = genId('ID');
      }
      return new Promise<IMsg>((res, rej) => {
        runRoute(
          id,
          id,
          flows,
          message,
          {
            kind: msgType,
            messageId: messageId,
            channelId: id,
            routeId: id,
            logger: logger({ channelId: id }),
            setGlobalVar,
            getGlobalVar: getGlobalVar,
            setChannelVar: setChannelVar(id),
            getChannelVar: getChannelVar(id),
            setMsgVar: setMsgVar(messageId),
            getMsgVar: getMsgVar(messageId),
          },
          true, // NOTE: this is a direct call to the route, the event handlers are not already initialized. This is a way to get around that.
          res,
        ).then((done) => {
          if (!done) rej(`Message ${id} was filtered`);
        });
      });
    });
  if (!messengers.has(id)) {
    messengers.set(id, func);
  }
  return [func, id];
};
