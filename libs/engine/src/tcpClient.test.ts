import net from 'net';
import Msg, { isMsg } from '@gofer-engine/hl7';
import { sendMessage } from './tcpClient';
import quickServer from './quickServer';

const channelID = 'tcpClientTest';

let SERVER: net.Server | undefined;
let HOST = 'localhost';
let PORT = 5504;

beforeAll((done) => {
  quickServer(channelID, done)
    .then(([server, host, port]) => {
      SERVER = server;
      HOST = host;
      PORT = port;
    })
    .catch((err) => fail(err));
});

test('tcpClient', async () => {
  const ack = new Msg(
    await sendMessage(
      HOST,
      PORT,
      String.fromCharCode(0x0b),
      String.fromCharCode(0x1c),
      String.fromCharCode(0x0d),
      1000,
      'MSH|^~\\&|HOSP|HIS|HOSP|PACS|20180104150804||ORM^O01|1|T|2.3\rZDS|1.2.398.7.1.1.2.494.0.1^^Application^DICOM',
      '1',
      '2',
      '3',
      true,
    ),
  );
  expect(isMsg(ack)).toBeTruthy();
  expect(ack.get('MSA.1')).toBe('AA');
});

afterAll(() => {
  SERVER?.close().unref();
});
