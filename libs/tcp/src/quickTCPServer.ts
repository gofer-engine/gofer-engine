import net from 'net';
import { getPortPromise } from 'portfinder';

import { logger } from '@gofer-engine/logger';
import { GetMsgType, IngestMsgFunc } from '@gofer-engine/message-type';
import { tcpServer } from './tcpServer';
import {
  getChannelVar,
  getGlobalVar,
  setChannelVar,
  setGlobalVar,
} from '@gofer-engine/variables';
import { MockIMsg } from './MockIMsg';
import { doAck } from '@gofer-engine/ack';

const host = '127.0.0.1';
// if port is used, the next available port will be used
const port = 5500;

export const quickTCPServer = async (
  channelId: string,
  listening: undefined | (() => void),
  getMsgType: GetMsgType = () => MockIMsg,
): Promise<[net.Server, string, number]> => {
  const cb: IngestMsgFunc = async (msg, ack, context) => {
    const ackMsg = doAck(
      msg,
      undefined,
      { channelId },
      context,
      getMsgType,
    );
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
      getMsgType,
      true,
    );
    server?.on('listening', () => {
      listening?.();
    });
    return [server, host, openPort];
  });
};
