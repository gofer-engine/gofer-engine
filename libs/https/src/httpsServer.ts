import net from 'net';
import { IncomingMessage, ServerResponse } from 'http';
import { createServer } from 'https';

import { publishers } from "@gofer-engine/events";
import handelse from '@gofer-engine/handelse';
import { logger } from "@gofer-engine/logger";
import { GetMsgType, IContext, IMessageContext, IngestMsgFunc, TLogLevel } from '@gofer-engine/message-type';
import { QueueConfig } from "@gofer-engine/queue";
import { genId } from "@gofer-engine/tools";
import { getMsgVar, setMsgVar } from "@gofer-engine/variables";

import { HTTPSConfig } from "./types";

export const httpsServer = (
  id: string | number,
  httpsConfig: HTTPSConfig<'I'>,
  queueConfig: QueueConfig | undefined,
  logLevel: TLogLevel | undefined,
  ingestMessage: IngestMsgFunc,
  context: IContext,
  getMsgType: GetMsgType,
  direct?: boolean,
): net.Server => {
  if (queueConfig !== undefined) {
    publishers.onError(
      new Error(
        `Channel ${id} has a queue config in a https server. This is not yet supported.`,
      ),
    );
  }
  const {
    host,
    port,
    method = 'POST',
    path,
    basicAuth: { username, password } = {},
    msgType = 'HL7v2',
    ...options
  } = httpsConfig;
  const server = createServer(
    options,
    (req: IncomingMessage, res: ServerResponse) => {
      // if path is defined, then only respond to requests to that path
      // example if  path = '/hl7' then only respond to requests to https://localhost:8080/hl7
      // notice that the path must start with a `/` and the path must match exactly
      // the path also does include the query string exactly as it appears in the request
      // TODO: break out the path and query string into separate variables
      // TODO: add support for wildcards in the path
      // TODO: add support for regex in the path
      // TODO: add support to move query string into global variables
      if (path && req.url !== path) {
        context.logger(`IGNORED: Request path ${req.url} does not match configured path ${path}`, 'debug');
        return;
      }
      handelse.go(
        `gofer:${id}.onLog`,
        {
          log: `New client connection from ${req.socket.remoteAddress}:${req.socket.remotePort}`,
          channel: id,
        },
        {
          createIfNotExists: direct,
        },
      );
      if (req.method !== method) {
        handelse.go(
          `gofer:${id}.onLog`,
          {
            log: `Request method ${req.method} not allowed.`,
          },
          {
            createIfNotExists: direct,
          },
        );
        res.statusCode = 405;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Method Not Allowed');
        return;
      }
      if (req.headers['content-type'] !== 'x-application/hl7-v2+er7') {
        handelse.go(
          `gofer:${id}.onLog`,
          {
            log: `Request content-type ${req.headers['content-type']} not allowed. Currently only 'x-application/hl7-v2+er7' is supported.`,
          },
          {
            createIfNotExists: direct,
          },
        );
        res.statusCode = 415;
        res.setHeader('Content-Type', 'text/plain');
        res.end(
          `Request content-type ${req.method} not allowed. Currently only 'x-application/hl7-v2+er7' is supported.`,
        );
        return;
      }
      // check for basic auth and if configured, check the request headers against it
      if (username && password) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          handelse.go(
            `gofer:${id}.onLog`,
            {
              log: `Authorization header not found.`,
            },
            {
              createIfNotExists: direct,
            },
          );
          res.statusCode = 401;
          res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
          res.end('Unauthorized');
          return;
        }
        const [authType, encodedCredentials] = authHeader.split(' ');
        if (authType !== 'Basic') {
          handelse.go(
            `gofer:${id}.onLog`,
            {
              log: `Authorization type ${authType} not supported.`,
            },
            {
              createIfNotExists: direct,
            },
          );
          res.statusCode = 401;
          res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
          res.end('Unauthorized');
          return;
        }
        const credentials = Buffer.from(encodedCredentials, 'base64').toString(
          'ascii',
        );
        const [reqUsername, reqPassword] = credentials.split(':');
        if (reqUsername !== username || reqPassword !== password) {
          handelse.go(
            `gofer:${id}.onLog`,
            {
              log: `Invalid username or password.`,
            },
            {
              createIfNotExists: direct,
            },
          );
          res.statusCode = 401;
          res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
          res.end('Unauthorized');
          return;
        }
      }
      const chunks: Buffer[] = [];
      req.on('data', (packet) => {
        handelse.go(
          `gofer:${id}.onLog`,
          {
            log: `Received Data from Client ${req.socket.remoteAddress}:${req.socket.remotePort}`,
            channel: id,
          },
          {
            createIfNotExists: direct,
          },
        );
        chunks.push(packet);
      });
      req.on('end', () => {
        const hl7 = Buffer.concat(chunks).toString();
        const msg = getMsgType(msgType, hl7, true);
        const msgUUID = genId();
        const msgContext: IMessageContext = {
          ...context,
          kind: msgType,
          setMsgVar: setMsgVar(msgUUID),
          getMsgVar: getMsgVar(msgUUID),
          messageId: msgUUID,
          channelId: id,
          logger: logger({ channelId: id, msg }),
        };
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
        res.statusCode = 200;
        res.setHeader('Content-Type', 'x-application/hl7-v2+er7');
        ingestMessage(
          msg,
          (ack) => {
            res.end(ack.toString());
          },
          msgContext,
        );
      });
      req.on('close', () => {
        context.logger(`Client ${req.socket.remoteAddress}:${req.socket.remotePort} closed connection.`, 'debug');
      });
    },
  );

  server.listen(port, host, () => {
    handelse.go(
      `gofer:${id}.onLog`,
      {
        log: `HTTPS Server listening on ${host}:${port}`,
        channel: id,
      },
      {
        createIfNotExists: direct,
      },
    );
  });
  return server;
};
