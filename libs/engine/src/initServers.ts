import net from 'net';

import { logger } from "@gofer-engine/logger";
import { IContext, IMsg, IngestMsgFunc } from '@gofer-engine/message-type';
import { tcpServer } from "@gofer-engine/tcp";

import { verboseListeners } from './channelVerboseListeners';
import { runIngestFlows } from './runIngestFlows';
import { runRoutes } from './runRoutes';
import { InitServers } from './types';
import { getMsgType } from ".";
import { getChannelVar, getGlobalVar, setChannelVar, setGlobalVar } from "@gofer-engine/variables";
import { httpsServer } from "@gofer-engine/https";
import { httpServer } from "@gofer-engine/http";
import { events, listeners } from "@gofer-engine/events";
import { Job } from 'node-schedule';
import { schedulerServer } from '@gofer-engine/scheduler';

export const servers: Record<string | number, net.Server> = {};
export const jobs: Record<string | number, Job> = {};

export const initServers: InitServers = (channels) => {
  channels.forEach((channel) => {
    const eventHandlers = events<IMsg>(channel.id.toString());
    listeners.channels[channel.id] = eventHandlers;
    verboseListeners(channel.logLevel, eventHandlers);
    const context: IContext = {
      logger: logger({ channelId: channel.id }),
      setGlobalVar,
      getGlobalVar,
      setChannelVar: setChannelVar(channel.id),
      getChannelVar: getChannelVar(channel.id),
    };
    const ingestFunc: IngestMsgFunc = async (msg, ack, context) => {
      const ingestedMsg = runIngestFlows(channel, msg, ack, context);
      const accepted = typeof ingestedMsg === 'boolean' ? false : true;
      eventHandlers.onIngest.go({
        pre: msg,
        post: ingestedMsg,
        accepted,
        channel: channel.id.toString(),
      });
      if (ingestedMsg !== false) {
        const comp = await runRoutes(channel, ingestedMsg, context);
        eventHandlers.onComplete.go({
          orig: msg,
          channel: channel.id,
          status: comp,
        });
        return comp;
      }
      // NOTE: have to return true on filtered messages or else a Queue if exists will retry
      return true;
    }
    if (channel.source.kind === 'tcp') {
      servers[channel.id] = tcpServer(
        channel.id,
        channel.source.tcp,
        channel.source.queue,
        channel.logLevel,
        ingestFunc,
        context,
        getMsgType,
      );
    } else if (channel.source.kind === 'http') {
      servers[channel.id] = httpServer(
        channel.id,
        channel.source.http,
        channel.source.queue,
        channel.logLevel,
        ingestFunc,
        context,
        getMsgType,
      )
    } else if (channel.source.kind === 'https') {
      servers[channel.id] = httpsServer(
        channel.id,
        channel.source.https,
        channel.source.queue,
        channel.logLevel,
        ingestFunc,
        context,
        getMsgType,
      )
    } else if (channel.source.kind === 'schedule') {
      jobs[channel.id] = schedulerServer(
        channel.id,
        channel.source.schedule,
        undefined,
        channel.logLevel,
        ingestFunc,
        context,
        getMsgType,
      )
    }
  });
};
