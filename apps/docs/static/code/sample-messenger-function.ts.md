```ts title="/src/sample-messenger-function.ts"
import gofer from '@gofer-engine/engine';
import HL7v2Msg from '@gofer-engine/hl7';
import { genId } from '@gofer-engine/tools';

const EHR_HL7_IP = process.env['EHR_HL7_IP'];
const EHR_HL7_A20_PORT = parseInt(process.env['EHR_HL7_A20_PORT']);

const [messenger] = gofer.messenger((route) =>
  route.send('tcp', EHR_HL7_IP, EHR_HL7_A20_PORT),
);

const sendBedStatusUpdate = async (
  bed: string,
  status: 1 | 2,
  operator: string,
) => {
  const now = new Date().toISOString().replace(/-|:|T/g, '').slice(0, 12);
  return messenger((msg: HL7v2Msg) => {
    return msg
      .set('MSH-3', 'Gofer Engine')
      .set('MSH-4', 'Bed Board App')
      .set('MSH-5', 'ACME Hospital')
      .set('MSH-7', now)
      .set('MSH-9', 'ADT^A20^ADT_A20')
      .set('MSH-10', genId('UID'))
      .set('MSH-11-1', 'T')
      .set('MSH-11-2', 'T')
      .set('MSH-12', '2.4')
      .addSegment('EVN')
      .set('EVN-1', now)
      .set('EVN-5', operator)
      .addSegment(['NPU', bed, status.toString()]);
  });
};

export default sendBedStatusUpdate;
```
