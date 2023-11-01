import net from 'net';
import handelse from '@gofer-engine/handelse';
import Msg, { msgIsHL7v2 } from '@gofer-engine/hl7';
import {
  IContext,
  IMessageContext,
  IngestMsgFunc,
  QueueConfig,
  TLogLevel,
  TcpConfig,
} from './types';
import { queue } from './queue';
import { doAck } from './doAck';
import { isLogging, logger, mapOptions } from './helpers';
import { randomUUID } from 'crypto';
import { setMsgVar, getMsgVar } from './variables';

export const tcpServer = (
  id: string | number,
  tcpConfig: TcpConfig<'I'>,
  queueConfig: QueueConfig | undefined,
  logLevel: TLogLevel | undefined,
  ingestMessage: IngestMsgFunc,
  context: IContext,
  direct?: boolean,
): net.Server => {
  const {
    host,
    port,
    SoM = String.fromCharCode(0x0b),
    EoM = String.fromCharCode(0x1c),
    CR = String.fromCharCode(0x0d),
    maxConnections,
  } = tcpConfig;
  const server = net.createServer({ allowHalfOpen: false });
  if (maxConnections !== undefined) server.setMaxListeners(maxConnections);
  server.listen(port, host, () => {
    handelse.go(
      `gofer:${id}.onLog`,
      {
        log: `TCP Server listening on ${host}:${port}`,
        channel: id,
      },
      {
        createIfNotExists: direct,
      },
    );
  });
  server.on('connection', (socket) => {
    socket.setEncoding('utf8');

    const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
    handelse.go(
      `gofer:${id}.onLog`,
      {
        log: `New client connection from ${clientAddress}`,
        channel: id,
      },
      {
        createIfNotExists: direct,
      },
    );

    const data: Record<string, string> = {};

    socket.on('data', (packet) => {
      handelse.go(
        `gofer:${id}.onLog`,
        {
          log: `Received Data from Client ${clientAddress}:`,
          channel: id,
        },
        {
          createIfNotExists: direct,
        },
      );
      let hl7 = packet.toString();
      const f = hl7[0];
      const e = hl7[hl7.length - 1];
      const l = hl7[hl7.length - 2];
      // if beginning of a message and there is an existing partial message, then delete it
      if (f === SoM && data?.[clientAddress] !== undefined) {
        handelse.go(
          `gofer:${id}.onError`,
          {
            error: `MESSAGE LOSS: Partial message removed from ${clientAddress}`,
            channel: id,
          },
          {
            createIfNotExists: direct,
          },
        );
        delete data[clientAddress];
      }
      // if end of a message then see if there is a partial message to append it to.
      if (e === CR && l === EoM) {
        hl7 = hl7.slice(0, -2);
        if (f === SoM) {
          hl7 = hl7.slice(1);
        } else {
          hl7 = (data?.[clientAddress] || '') + hl7.slice(0, -2);
          delete data[clientAddress];
        }
        // else must not be the end of the message, so create/add to the partial message
      } else {
        // if this is the beginning of a message, then slice off the beginning message character
        if (f === SoM) {
          hl7 = hl7.slice(1);
        }
        data[clientAddress] = (data?.[clientAddress] || '') + hl7;
        return;
      }
      const msg = new Msg(hl7);
      const msgUUID = randomUUID();
      context.setMsgVar = setMsgVar(msgUUID);
      context.getMsgVar = getMsgVar(msgUUID);
      context.messageId = msgUUID;
      context.channelId = id;
      context.logger = logger({ channelId: id, msg });
      handelse.go(
        `gofer:${id}.onReceive`,
        {
          msg,
          channel: id,
        },
        {
          createIfNotExists: direct,
        },
      );
      if (queueConfig) {
        handelse.go(
          `gofer:${id}.onLog`,
          {
            log: `Utilizing queue ${id}.source`,
            channel: id,
          },
          {
            createIfNotExists: direct,
          },
        );
        const ack = doAck(
          msg,
          { text: 'Queued' },
          {
            channelId: id,
            flowId: 'source',
          },
          context as IMessageContext,
        );
        const ackStr = ack.toString();
        socket.write(SoM + ackStr + EoM + CR);
        handelse.go(
          `gofer:${id}.onAck`,
          {
            channel: id,
            msg: msg,
            ack: ack,
          },
          {
            createIfNotExists: direct,
          },
        );
        queue(
          `${id}.source`,
          (msg) => ingestMessage(msg, undefined, context as IMessageContext),
          msg,
          mapOptions({
            ...queueConfig,
            verbose:
              queueConfig !== undefined
                ? queueConfig.verbose
                : isLogging('debug', logLevel),
          }),
        );
      } else {
        ingestMessage(
          msg,
          (ack) => {
            const ackStr = ack.toString();
            socket.write(SoM + ackStr + EoM + CR);
          },
          context as IMessageContext,
        );
      }
    });
    socket.on('close', (data) => {
      if (isLogging('debug', logLevel))
        console.log(
          `Client ${clientAddress} disconnected`,
          `data: ${JSON.stringify(data)}`,
        );
    });
  });
  return server;
};
