import { XMLMsg } from '.';
import fs from 'fs';

const patient = fs.readFileSync('./samples/sample.xml', 'utf8');
const expected = fs.readFileSync('./samples/expected.xml', 'utf8');
const json = fs.readFileSync('./samples/xml.json', 'utf8');
const jsonCompacted = fs.readFileSync('./samples/xml_compact.json', 'utf8');

test('XMLMsg', () => {
  expect(patient.substring(0, 5)).toBe('<?xml');
  const msg = new XMLMsg(patient);
  expect(msg).toBeInstanceOf(XMLMsg);
  // NOTE: the line breakings are a tad different and inconsistent but equate to the same xml structure.
  expect(msg.toString()).toBe(expected);
  expect(msg.json()).toEqual(JSON.parse(jsonCompacted));
  expect(msg.json(true)).toEqual(JSON.parse(json));
  expect(msg.get('Patient.id')).toBe('example');
  expect(msg.get('Patient.identifier.value')).toBe('12345');
  expect(msg.get('Patient.text.div.table.tr[0].td[2]')).toBe('Deceased:');
  expect(
    msg
      .set('Patient.text.div.table.tr[0].td[2]', 'Expired:')
      .get('Patient.text.div.table.tr[0].td[2]'),
  ).toBe('Expired:');
  expect(msg.set('Patient.id', '456A').get('Patient.id')).toBe('456A');
  expect(
    msg
      .set(
        'Patient.name[0]',
        '<use value="official"/><family value="Doe"/><given value="John"/>',
        true,
      )
      .get('Patient.name[0].family'),
  ).toBe('Doe');
});
