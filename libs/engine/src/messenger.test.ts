import { isMsg } from '@gofer-engine/hl7';
import { messenger as Messenger } from './messenger';
import { genId } from './genId';

const [messenger, messengerId] = Messenger((route) => {
  route.id(genId());
  route.send('tcp', '127.0.0.1', 5503);
  return route;
});

test('messenger defined', () => {
  expect(Messenger).toBeDefined();
  expect(Messenger).toBeInstanceOf(Function);
  expect(messenger).toBeDefined();
  expect(messengerId).toBe('500f9f18-a8bb-4171-9e94-22c3b681c505');
  expect(messenger).toBeInstanceOf(Function);
});

test('messenger works', async () => {
  const msgDate = new Date().toISOString().replace(/-|:|T/g, '').slice(0, 12);
  const ack = await messenger((msg) => {
    const msgId = genId('ID');
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
      .set('NPU-1', '1'); // Bed Status. Table 0116: 1=Cleaning in Process, 2=Clean. Any other value will be rejected.
    console.log(msg.toString());
    return msg;
  });
  expect(isMsg(ack)).toBeTruthy();
  expect(ack.toString()).toBe(
    `MSH|^~\\&|MRHC Apps|MRHC|ADM|MT|2023-06-||ADT^A20^ADT_A20|1|T|2.4\nEVN||2023-06-|||0507\nNPU|1`
  );
});
