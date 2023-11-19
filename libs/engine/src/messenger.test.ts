import net from 'net';
import { msgIsHL7v2 } from '@gofer-engine/hl7';
import { messenger } from './messenger';
import { genId } from '@gofer-engine/tools';
import { quickTCPServer } from '@gofer-engine/tcp'
import { MessengerFunc } from './types';
import { isMsg } from '@gofer-engine/message-type';

const channelID = 'messengerTest';

let SERVER: net.Server | undefined;
let HOST = 'localhost';
let PORT = 5504;
let EMITTER: MessengerFunc | undefined;
let messengerId: string | undefined;

beforeAll((done) => {
  quickTCPServer(channelID, done)
    .then(([server, host, port]) => {
      SERVER = server;
      HOST = host;
      PORT = port;
      const [emitter, id] = messenger((route) => {
        route.id(genId());
        route.send('tcp', HOST, PORT);
        return route;
      });
      EMITTER = emitter;
      messengerId = id;
    })
    .catch((err) => fail(err));
});

test('messenger defined', () => {
  expect(messenger).toBeDefined();
  expect(messenger).toBeInstanceOf(Function);
  expect(EMITTER).toBeDefined();
  expect(messengerId).toBe('500f9f18-a8bb-4171-9e94-22c3b681c505');
  expect(EMITTER).toBeInstanceOf(Function);
});

test('messenger works', async () => {
  const msgDate = new Date().toISOString().replace(/-|:|T/g, '').slice(0, 12);
  const ack = await EMITTER?.((msg) => {
    const msgId = genId('ID');
    if (!msgIsHL7v2(msg)) {
      fail('Message is not HL7v2');
    }
    msg
      .set('MSH-3', 'MRHC Apps')
      .set('MSH-4', 'MRHC')
      .set('MSH-5', 'ADM')
      .set('MSH-6', 'MT')
      .set('MSH-7', msgDate)
      .set('MSH-9.1', 'ADT')
      .set('MSH-9.2', 'A20')
      .set('MSH-9.3', 'ADT_A20')
      .set('MSH-10', msgId)
      .set('MSH-11', 'T') // change to P for production
      .set('MSH-12', '2.4')
      .addSegment(['EVN', null, msgDate])
      .set('EVN-5', '0507') // Operator ID needs to be set in Meditech in EVS Staff Dictionary. Path: Administrative > Registration > Dictionary (REG Registration) > EVS Staff
      .addSegment('NPU')
      .set('NPU-1', '1051') // Bed Location (aka Telephony Ext) needs to be set in Meditech in MIS Room Dictionary. Path: Info Systems > MIS > Dictionaries > Administrative > Room
      .set('NPU-2', '1'); // Bed Status. Table 0116: 1=Cleaning in Process, 2=Clean. Any other value will be rejected.
    return msg;
  });
  expect(isMsg(ack)).toBeTruthy();
  expect(ack?.get('MSA.1')).toBe('AA');
});

afterAll(() => {
  SERVER?.close().unref();
});
