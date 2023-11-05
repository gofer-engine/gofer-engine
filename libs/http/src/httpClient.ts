import http from 'http';

import handelse from '@gofer-engine/handelse';
import { GetMsgType, IMessageContext, IMsg, functionalVal } from '@gofer-engine/message-type';
import { HTTPConfig } from "./types";
import { onLog } from "@gofer-engine/events";

export type HttpClientFunc = (
  opt: HTTPConfig<'O'>,
  msg: IMsg,
  stringify: ((msg: IMsg) => string) | undefined,
  parse: ((data: string) => IMsg) | undefined,
  channelId: string | number | undefined,
  routeId: string | number | undefined,
  flowId: string | number | undefined,
  context: IMessageContext,
  getMsgType: GetMsgType,
  direct?: boolean,
) => Promise<IMsg>;

export const sendMessage = async (
  host: string,
  port: number,
  path: string | undefined,
  method: HTTPConfig<'O'>['method'] = 'POST',
  responseTimeout: number | false | undefined,
  username: string | undefined,
  password: string | undefined,
  data: string,
  channel?: string | number,
  route?: string | number,
  flow?: string | number,
  context?: IMessageContext,
  direct?: boolean,
): Promise<string> => {
  if (responseTimeout !== undefined) {
    handelse.go(
      `gofer:${channel}.onLog`,
      {
        log: `TODO: HTTP responseTimeout is not yet implemented`,
        channel,
        route,
        flow,
      },
      {
        createIfNotExists: direct,
      },
    );
    onLog.go('TODO: HTTP responseTimeout is not yet implemented');
    onLog.go({ responseTimeout });
  }
  return new Promise<string>((res, rej) => {
    const client = http.request({
      host,
      port,
      path,
      method,
      auth: username && password ? `${username}:${password}` : undefined,
      headers: {
        'Content-Type': 'x-application/hl7-v2+er7',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (response) => {
      context?.logger(`STATUS: ${response.statusCode}`, 'debug');
      context?.logger(`HEADERS: ${JSON.stringify(response.headers)}`, 'debug');
      response.setEncoding('utf8');
      const chunks: string[] = [];
      response.on('data', (chunk) => {
        chunks.push(chunk);
      });
      response.on('end', () => {
        res(chunks.join(''));
        handelse.go(`gofer:${channel}.onLog`, {
          log: `Requested an end to the TCP connection`,
          msg: data,
          channel,
          route,
          flow,
        });
      });
    });
    client.on('error', (err) => {
      handelse.go(
        `gofer:${channel}.onError`,
        {
          error: err,
          msg: data,
          channel,
          route,
          flow,
        },
        {
          createIfNotExists: direct,
        },
      );
      rej(err);
    });
    client.write(data);
    client.end();
  });
};

export const httpClient: HttpClientFunc = async (
  {
    host,
    port,
    method = 'POST',
    path,
    basicAuth: {
      username,
      password,
    } = {},
    responseTimeout,
  },
  msg,
  stringify = (msg) => msg.toString(),
  parse,
  channelId,
  routeId,
  flowId,
  context,
  getMsgType,
  direct,
) => {
  if (parse === undefined) {
    parse = (data: string) => getMsgType(context.kind, data);
  }
  const config: {
    host?: string;
    port?: number;
    method?: "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH";
    path?: string;
    username?: string;
    password?: string;
  } = {};
  try {
    config.host = functionalVal(host, msg, context);
    config.port = functionalVal(port, msg, context);
    config.method = functionalVal(method, msg, context);
    config.path = functionalVal(path || '', msg, context);
    config.username = functionalVal(username || '', msg, context);
    config.password = functionalVal(password || '', msg, context);
    if (config.path === '') config.path = undefined;
    if (config.username === '') config.username = undefined;
    if (config.password === '') config.password = undefined;
  } catch (err: unknown) {
    handelse.go(
      `gofer:${channelId}.onError`,
      {
        error: err,
        msg,
        channel: channelId,
        route: routeId,
        flow: flowId,
      },
      {
        createIfNotExists: direct,
      },
    );
  }
  if (
    config.host !== undefined &&
    config.port !== undefined &&
    config.method !== undefined
  ) {
    const ack = await sendMessage(
      config.host,
      config.port,
      config.path,
      config.method,
      responseTimeout,
      config.username,
      config.password,
      stringify(msg),
      channelId,
      routeId,
      flowId,
      context,
      direct,
    );
    return parse(ack);
  }
  throw new Error('HTTP client configuration is invalid');
};
