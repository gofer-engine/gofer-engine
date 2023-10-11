import net from 'net';
import { IMsg } from '@gofer-engine/hl7';
import { verboseListeners } from './channelVerboseListeners';
import { events } from './events';
import { runIngestFlows } from './runIngestFlows';
import { runRoutes } from './runRoutes';
import { tcpServer } from './tcpServer';
import { IContext, InitServers } from './types';
import { listeners } from './eventHandlers';
import { logger } from './helpers';
import {
  getGlobalVar,
  setGlobalVar,
  getChannelVar,
  setChannelVar,
} from './variables';

export const servers: Record<string | number, net.Server> = {};

export const initServers: InitServers = (channels) => {
  channels
    .filter((channel) =>
      Object.prototype.hasOwnProperty.call(channel.source, 'tcp'),
    )
    .forEach((c) => {
      const e = events<IMsg>(c.id.toString());
      listeners.channels[c.id] = e;
      verboseListeners(c.logLevel, e);
      const context: IContext = {
        logger: logger({ channelId: c.id }),
        setGlobalVar,
        getGlobalVar,
        setChannelVar: setChannelVar(c.id),
        getChannelVar: getChannelVar(c.id),
      };
      servers[c.id] = tcpServer(
        c,
        async (msg, ack, context) => {
          const ingestedMsg = runIngestFlows(c, msg, ack, context);
          const accepted = typeof ingestedMsg === 'boolean' ? false : true;
          e.onIngest.go({
            pre: msg,
            post: ingestedMsg,
            accepted,
            channel: c.id.toString(),
          });
          if (ingestedMsg !== false) {
            const comp = await runRoutes(c, ingestedMsg, context);
            e.onComplete.go({
              orig: msg,
              channel: c.id,
              status: comp,
            });
            return comp;
          }
          // NOTE: have to return true on filtered messages or else a Queue if exists will retry
          return true;
        },
        context,
      );
    });
};
