import { onError, onLog } from "@gofer-engine/events";
import net from 'net';
import { getPortPromise } from "portfinder";

const PORT = parseInt(process.env?.['API_PORT'] ?? '8080');
const HOST = '0.0.0.0';

interface IApiOptions {
  verbose?: boolean;
}

interface IHttpRequest {
  protocol: string;
  method: string;
  url: string;
  headers: Map<string, string>;
  body: string;
}

const parseRequest = (s: string): IHttpRequest => {
  const [firstLine, rest] = divideStringOn(s, '\r\n');
  const [method, url, protocol] = firstLine.split(' ', 3);
  const [headers, body] = divideStringOn(rest, '\r\n\r\n');
  const parsedHeaders = headers.split('\r\n').reduce((map, header) => {
    const [key, value] = divideStringOn(header, ': ');
    return map.set(key, value);
  }, new Map());
  return { protocol, method, url, headers: parsedHeaders, body };
};

const divideStringOn = (s: string, search: string) => {
  const index = s.indexOf(search);
  const first = s.slice(0, index);
  const rest = s.slice(index + search.length);
  return [first, rest];
};

interface IHttpResponse {
  status: string;
  statusCode: number;
  protocol: string;
  headers: Map<string, string>;
  body: string;
}

const compileResponse = (r: IHttpResponse): string => `${r.protocol} ${
  r.statusCode
} ${r.status}
${Array.from(r.headers)
  .map((kv) => `${kv[0]}: ${kv[1]}`)
  .join('\r\n')}

${r.body}`;

export const apiServer = (
  handler?: (request: IHttpRequest) => Promise<IHttpResponse>,
  { verbose }: IApiOptions = {},
) => {
  // if PORT is not available, try to find an available port
  getPortPromise({ port: PORT }).then(port => {
    if (port !== PORT) {
      onLog.go(`gofer Engine Management API port ${PORT} is not available, using ${port} instead`);
    }
    const server = net
      .createServer()
      .listen(port, HOST)
      .on('connection', (socket) => {
        if (verbose)
          onLog.go(
            `New Management API connection from ${socket.remoteAddress}:${socket.remotePort}`,
          );
        socket.on('data', async (buffer) => {
          const request = parseRequest(buffer.toString());
          const resp =
            typeof handler === 'function'
              ? await handler(request)
              : {
                  protocol: request.protocol,
                  headers: new Map([['Content-Type', 'application/json']]),
                  status: 'Missing Handler',
                  statusCode: 400,
                  body: '',
                };
          socket.write(compileResponse(resp));
          socket.end();
        });
      })
      .on('error', (err) => {
        onError.go(err);
      })
      .on('listening', () => {
        onLog.go(`gofer Engine Management API listening on ${HOST}:${port}`);
        return () => {
          server.close();
          server.unref();
        };
      });
  });
};
