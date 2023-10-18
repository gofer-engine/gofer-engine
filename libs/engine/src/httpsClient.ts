import https from 'https';
import handelse from '@gofer-engine/handelse';
import Msg, { IMsg } from '@gofer-engine/hl7';
import { onLog } from './eventHandlers';
import { HTTPSConfig, IMessageContext } from './types';
import { functionalVal } from './helpers';

export type HttpsClientFunc<T, R> = (
  opt: HTTPSConfig<'O'>,
  msg: T,
  stringify: ((msg: T) => string) | undefined,
  parse: ((data: string) => R) | undefined,
  channelId: string | number | undefined,
  routeId: string | number | undefined,
  flowId: string | number | undefined,
  context: IMessageContext,
  direct?: boolean,
) => Promise<IMsg>;

export const sendMessage = async (
  host: string,
  port: number,
  path: string | undefined,
  method: HTTPSConfig<'O'>['method'] = 'POST',
  sslOptions: {
    // props for cert/ssl support from tls.connect
    ca?: string | string[] | Buffer | Buffer[];
    cert?: string | string[] | Buffer | Buffer[];
    ciphers?: string;
    clientCertEngine?: string;
    crl?: string | string[] | Buffer | Buffer[];
    dhparam?: string | Buffer;
    ecdhCurve?: string;
    honorCipherOrder?: boolean;
    key?: string | string[] | Buffer | Buffer[];
    passphrase?: string;
    pfx?:
      | string
      | string[]
      | Buffer
      | Buffer[]
      | { buf: string | Buffer; passphrase?: string }[];
    secureOptions?: number;
    secureProtocol?: string;
    sessionIdContext?: string;
    rejectUnauthorized?: boolean;
    severname?: string;
  },
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
    const client = https.request(
      {
        host,
        port,
        path,
        method,
        auth: username && password ? `${username}:${password}` : undefined,
        headers: {
          'Content-Type': 'x-application/hl7-v2+er7',
          'Content-Length': Buffer.byteLength(data),
        },
        ...sslOptions,
      },
      (response) => {
        context?.logger(`STATUS: ${response.statusCode}`, 'debug');
        context?.logger(
          `HEADERS: ${JSON.stringify(response.headers)}`,
          'debug',
        );
        response.setEncoding('utf8');
        const chunks: string[] = [];
        response.on('data', (chunk) => {
          console.log('data');
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
      },
    );
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

export const httpsClient: HttpsClientFunc<IMsg, IMsg> = async (
  {
    host,
    port,
    method = 'POST',
    path,
    basicAuth: { username, password } = {},
    responseTimeout,
    ca,
    cert,
    ciphers,
    clientCertEngine,
    crl,
    dhparam,
    ecdhCurve,
    honorCipherOrder,
    key,
    passphrase,
    pfx,
    rejectUnauthorized,
    secureOptions,
    secureProtocol,
    sessionIdContext,
    severname,
  },
  msg,
  stringify = (msg: IMsg) => msg.toString(),
  parse = (data: string) => new Msg(data),
  channelId,
  routeId,
  flowId,
  context,
  direct,
) => {
  const config: {
    host?: string;
    port?: number;
    method?:
      | 'GET'
      | 'HEAD'
      | 'POST'
      | 'PUT'
      | 'DELETE'
      | 'CONNECT'
      | 'OPTIONS'
      | 'TRACE'
      | 'PATCH';
    path?: string;
    username?: string;
    password?: string;
    // props for cert/ssl support from tls.connect
    ca?: string | string[] | Buffer | Buffer[];
    cert?: string | string[] | Buffer | Buffer[];
    ciphers?: string;
    clientCertEngine?: string;
    crl?: string | string[] | Buffer | Buffer[];
    dhparam?: string | Buffer;
    ecdhCurve?: string;
    honorCipherOrder?: boolean;
    key?: string | string[] | Buffer | Buffer[];
    passphrase?: string;
    pfx?:
      | string
      | string[]
      | Buffer
      | Buffer[]
      | { buf: string | Buffer; passphrase?: string }[];
    secureOptions?: number;
    secureProtocol?: string;
    sessionIdContext?: string;
    rejectUnauthorized?: boolean;
    severname?: string;
  } = {};
  try {
    config.host = functionalVal(host, msg, context);
    config.port = functionalVal(port, msg, context);
    config.method = functionalVal(method, msg, context);
    config.path = functionalVal(path, msg, context);
    config.username = functionalVal(username, msg, context);
    config.password = functionalVal(password, msg, context);
    config.ca = functionalVal(ca, msg, context);
    config.cert = functionalVal(cert, msg, context);
    config.ciphers = functionalVal(ciphers, msg, context);
    config.clientCertEngine = functionalVal(clientCertEngine, msg, context);
    config.crl = functionalVal(crl, msg, context);
    config.dhparam = functionalVal(dhparam, msg, context);
    config.ecdhCurve = functionalVal(ecdhCurve, msg, context);
    config.honorCipherOrder = functionalVal(honorCipherOrder, msg, context);
    config.key = functionalVal(key, msg, context);
    config.passphrase = functionalVal(passphrase, msg, context);
    config.pfx = functionalVal(pfx, msg, context);
    config.rejectUnauthorized = functionalVal(rejectUnauthorized, msg, context);
    config.secureOptions = functionalVal(secureOptions, msg, context);
    config.secureProtocol = functionalVal(secureProtocol, msg, context);
    config.sessionIdContext = functionalVal(sessionIdContext, msg, context);
    config.severname = functionalVal(severname, msg, context);
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
    const { host, port, path, method, username, password, ...sslConfig } =
      config;
    const ack = await sendMessage(
      host,
      port,
      path,
      method,
      sslConfig,
      responseTimeout,
      username,
      password,
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
