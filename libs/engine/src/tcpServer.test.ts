import net from 'net'
import { logger } from './helpers';
import { tcpServer } from './tcpServer';
import {
  getChannelVar,
  getGlobalVar,
  setChannelVar,
  setGlobalVar,
} from './variables';
import { AckFunc, IMessageContext, IngestMsgFunc } from './types';
import { IMsg } from '@gofer-engine/hl7';

const channelID = 'test';
const cb: IngestMsgFunc = async (msg: IMsg, ack: AckFunc | undefined, context?: IMessageContext) => true

const HOST = '127.0.0.1';
const PORT = 5503;

let server: net.Server | undefined;

beforeAll((done) => {
  server = tcpServer(
    {
      id: channelID,
      logLevel: 'debug',
      source: {
        kind: 'tcp',
        tcp: {
          host: HOST,
          port: PORT,
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

test.todo('write tcpServer operation tests')

test('tcpServer', async () => {
  expect(server).toBeDefined();
});

afterAll(() => {
  server?.close().unref();
});
