import net from 'net';
import { getPortPromise } from 'portfinder';

import { logger } from "@gofer-engine/logger";
import { IngestMsgFunc } from "@gofer-engine/message-type";

import { tcpServer } from './tcpServer';
import { getChannelVar, getGlobalVar, setChannelVar, setGlobalVar } from "@gofer-engine/variables";
import { MockIMsg } from './MockIMsg'

const channelID = 'tcpServerTest';
const cb: IngestMsgFunc = async () => true;

const HOST = '127.0.0.1';

let server: net.Server | undefined;

beforeAll((done) => {
  getPortPromise({ host: HOST, port: 5503 })
    .then((openPort) => {
      server = tcpServer(
        channelID,
        {
          host: HOST,
          port: openPort,
        },
        undefined,
        'debug',
        cb,
        {
          getChannelVar: getChannelVar(channelID),
          getGlobalVar: getGlobalVar,
          logger: logger({ channelId: channelID }),
          setChannelVar: setChannelVar(channelID),
          setGlobalVar: setGlobalVar,
        },
        () => MockIMsg,
        true,
      );
      server?.on('listening', () => {
        done();
      });
    })
    .catch((err) => fail(err));
});

test.todo('write tcpServer operation tests');

test('tcpServer', async () => {
  expect(server).toBeDefined();
});

afterAll(() => {
  server?.close().unref();
});
