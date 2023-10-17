import net from 'net';
import { doAck } from './doAck';
import { IngestMsgFunc } from './types';
import { getPortPromise } from 'portfinder';
import { tcpServer } from './tcpServer';
import {
  getChannelVar,
  getGlobalVar,
  setChannelVar,
  setGlobalVar,
} from './variables';
import { logger } from './helpers';

const host = '127.0.0.1';
// if port is used, the next available port will be used
const port = 5500;

const quickServer = async (
  channelId: string,
  listening: undefined | (() => void),
): Promise<[net.Server, string, number]> => {
  const cb: IngestMsgFunc = async (msg, ack, context) => {
    const ackMsg = doAck(msg, undefined, { channelId }, context);
    ack?.(ackMsg, context);
    return true;
  };
  return getPortPromise({ host, port }).then((openPort) => {
    const server = tcpServer(
      channelId,
      {
        host,
        port: openPort,
      },
      undefined,
      undefined,
      cb,
      {
        getChannelVar: getChannelVar(channelId),
        getGlobalVar: getGlobalVar,
        logger: logger({ channelId }),
        setChannelVar: setChannelVar(channelId),
        setGlobalVar: setGlobalVar,
      },
      true,
    );
    server?.on('listening', () => {
      listening?.();
    });
    return [server, host, openPort];
  });
};

export default quickServer;
