import Msg, { IMsg, isMsg } from '@gofer-engine/hl7';
import { MessengerFunc, MessengerRoute } from './types';
import { RouteClass } from './RouteClass';
import { runRoute } from './runRoutes';
import { logger } from './helpers';
import {
  getChannelVar,
  getGlobalVar,
  getMsgVar,
  setChannelVar,
  setGlobalVar,
  setMsgVar,
} from './variables';
import { genId } from './genId';

const messengers = new Map<string, MessengerFunc>();

export const messenger = (
  route: MessengerRoute,
): [messenger: MessengerFunc, id: string] => {
  const config = route(new RouteClass()).export();
  const flows = config.flows;
  const id = typeof config.id === 'number' ? config.id.toString() : config.id;
  const func =
    messengers.get(id) ??
    ((msg) => {
      const message =
        typeof msg === 'function'
          ? msg(new Msg())
          : isMsg(msg)
          ? msg
          : new Msg(msg);
      const messageId = message.id() ?? genId('ID');
      return new Promise<IMsg>((res, rej) => {
        runRoute(
          id,
          id,
          flows,
          message,
          {
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
