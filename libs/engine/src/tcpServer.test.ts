import net from 'net'
import { logger } from './helpers';
import { tcpServer } from './tcpServer';
import {
  getChannelVar,
  getGlobalVar,
  setChannelVar,
  setGlobalVar,
} from './variables';
import { IngestMsgFunc } from './types';
import { getPortPromise } from 'portfinder';

const channelID = 'tcpServerTest';
const cb: IngestMsgFunc = async () => true

const HOST = '127.0.0.1';

let server: net.Server | undefined;

beforeAll((done) => {
  getPortPromise({ host: HOST, port: 5503 })
  .then((openPort) => {
    server = tcpServer(
      {
        id: channelID,
        logLevel: 'debug',
        source: {
          kind: 'tcp',
          tcp: {
            host: HOST,
            port: openPort,
          },
        },
        ingestion: [],
        name: 'test',
      },
      cb,
      {
        getChannelVar: getChannelVar(channelID),
        getGlobalVar: getGlobalVar,
        logger: logger({ channelId: channelID }),
        setChannelVar: setChannelVar(channelID),
        setGlobalVar: setGlobalVar,
      },
      true
    );
    server?.on('listening', () => {
      done();
    })
  })
  .catch(err => fail(err))
})

test.todo('write tcpServer operation tests')

test('tcpServer', async () => {
  expect(server).toBeDefined();
});

afterAll(() => {
  server?.close().unref();
});
