import Msg, { isMsg } from '@gofer-engine/hl7'
import { sendMessage } from './tcpClient'

test('tcpClient', async () => {
  const ack = new Msg(await sendMessage(
    '127.0.0.1',
    5504,
    String.fromCharCode(0x0b),
    String.fromCharCode(0x1c),
    String.fromCharCode(0x0d),
    1000,
    'MSH|^~\\&|HOSP|HIS|HOSP|PACS|20180104150804||ORM^O01|1|T|2.3\rZDS|1.2.398.7.1.1.2.494.0.1^^Application^DICOM',
    '1',
    '2',
    '3',
    true,
  ))
  expect(isMsg(ack)).toBeTruthy()
  expect(ack.get('MSA.1')).toBe('AA')
})
