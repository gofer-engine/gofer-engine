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
  channels.forEach((c) => {
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
    const ingestFunc: IngestMsgFunc = async (msg, ack, context) => {
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
    }
    if (c.source.kind === 'tcp') {
      servers[c.id] = tcpServer(
        c.id,
        c.source.tcp,
        c.source.queue,
        c.logLevel,
        ingestFunc,
        context,
        getMsgType,
      );
    } else if (c.source.kind === 'http') {
      servers[c.id] = httpServer(
        c.id,
        c.source.http,
        c.source.queue,
        c.logLevel,
        ingestFunc,
        context,
        getMsgType,
      )
    } else if (c.source.kind === 'https') {
      servers[c.id] = httpsServer(
        c.id,
        c.source.https,
        c.source.queue,
        c.logLevel,
        ingestFunc,
        context,
        getMsgType,
      )
    } else if (c.source.kind === 'schedule') {
      jobs[c.id] = schedulerServer(
        c.id,
        c.source.schedule,
        undefined,
        c.logLevel,
        ingestFunc,
        context,
        getMsgType,
      )
    }
  });
};
