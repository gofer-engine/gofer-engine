import net from 'net';
import { logger } from './helpers';
import { tcpServer } from './tcpServer';
import {
  getChannelVar,
  getGlobalVar,
  setChannelVar,
  setGlobalVar,
} from './variables';
import { AckFunc, IMessageContext } from './types';
import { IMsg } from '@gofer-engine/hl7';

const channelID = 'test';
let server: net.Server | undefined = undefined;
const cb = jest.fn(
  async (msg: IMsg, ack: AckFunc | undefined, context?: IMessageContext) => true
);

beforeAll(() => {
  server = tcpServer(
    {
      id: channelID,
      logLevel: 'debug',
      source: {
        kind: 'tcp',
        tcp: {
          host: '127.0.0.1',
          port: 5503,
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
});

const msg =
  String.fromCharCode(0x0b) +
  `MSH|^~\\&|TEST|TEST|TEST|TEST|199912271408||ADT^A04^ADT_A04|1817457|D|2.5|` +
  String.fromCharCode(0x1c) +
  String.fromCharCode(0x0d);

test('tcpServer', async () => {
  expect(server).toBeDefined();
  // const client = new net.Socket()
  // await new Promise(async (res) => {
  //   client.connect({ port: 5503, host: '127.0.0.1' }, async () => {
  //     const w = client.write(msg)
  //     console.log(w)
  //     return res(true)
  //   })
  // })
  // expect(cb).toHaveBeenCalled()
});

afterAll(() => {
  server?.close();
});
