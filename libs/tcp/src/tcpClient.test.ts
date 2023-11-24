import net from 'net';

import { sendMessage } from './tcpClient';
import { quickTCPServer } from './quickTCPServer';

const channelID = 'tcpClientTest';

let SERVER: net.Server | undefined;
let HOST: string;
let PORT: number;

beforeAll((done) => {
  quickTCPServer(channelID, done)
    .then(([server, host, port]) => {
      SERVER = server;
      HOST = host;
      PORT = port;
    })
    .catch((err) => fail(err));
});

test('tcpClient', async () => {
  const messageResponse = await sendMessage(
    HOST,
    PORT,
    String.fromCharCode(0x0b),
    String.fromCharCode(0x1c),
    String.fromCharCode(0x0d),
    undefined,
    'MSH|^~\\&|HOSP|HIS|HOSP|PACS|20180104150804||ORM^O01|1|T|2.3\rZDS|1.2.398.7.1.1.2.494.0.1^^Application^DICOM',
    '1',
    '2',
    '3',
    true,
  );
  /**
   * NOTE: the response of the ack is the MockIMsg toString. In the actual
   * implementation the response is one of the message types retrieved with the
   * getMsgType, but that is not available in the test at this level or else
   * circular dependencies would occur.
   */
  expect(messageResponse).toBe('MockIMsg')
});

afterAll(() => {
  SERVER?.close().unref();
});
