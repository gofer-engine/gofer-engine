import { XMLMsg } from '.';
import fs from 'fs';

const patient = fs.readFileSync('./samples/sample.xml', 'utf8');
const json = fs.readFileSync('./samples/xml.json', 'utf8');
const jsonCompacted = fs.readFileSync('./samples/xml_compact.json', 'utf8');

const normalizeLE = (string: string) => string.replace(/\r\n|\r|\n/g, '\n');

describe('XMLMsg', () => {
  test('read xml sample file', () => {
    expect(patient.substring(0, 5)).toBe('<?xml');
  })
  let msg = new XMLMsg(patient);
  test('can init class', () => {
    expect(msg).toBeInstanceOf(XMLMsg);
  // NOTE: the line breakings are a tad different and inconsistent but equate to the same xml structure.
  });

  describe('methods', () => {
    beforeEach(() => {
      msg = new XMLMsg(patient);
    });

    test('can stringify', () => {
      expect(normalizeLE(msg.toString())).toBe(normalizeLE(patient));
    });
    test('can convert to compacted json', () => {
      expect(msg.json()).toEqual(JSON.parse(jsonCompacted));
    });
    test('can convert to normalized json', () => {
      expect(msg.json(true)).toEqual(JSON.parse(json));
    });
    test('can get path using local-name', () => {
      expect(msg.get(`string(/*[local-name()='Patient']/*[local-name()='id']/@value)`).toString()).toBe("example");
    });
    test('can get path using manually defined prefix', () => {
      expect(msg.get(`string(/foo:Patient/foo:id/@value)`, { foo: 'http://hl7.org/fhir', bar: 'http://www.w3.org/1999/xhtml' }).toString()).toBe("example");
    });
    test('can get path using auto defined prefixes', () => {
      expect(msg.get(`string(/fhir:Patient/fhir:id/@value)`, true).toString()).toBe("example");
    });
    test('can get path removing namespaces', () => {
      expect(msg.get(`string(/Patient/id/@value)`, false).toString()).toBe("example");
    });
    test('can apply XSLT tranformer', () => {
      expect(msg.applyXSLT(`<?xml version="1.0"?>
        <xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
          <!-- TODO: add some transformation here -->
        </xsl:stylesheet>
      `).toString()).toBe('')
    })
    
    // test('can use document api', () => {
    //   msg.get<Document>().getElementsByTagName('id').item(0).setAttribute('value', 'e456A');
    //   expect(msg.get('/Patient/id/@value')).toBe('e456A');
    // });
    // test('can use document api without writeBack', () => {
    //   msg.document((doc) => {
    //     doc.getElementsByTagName('id').item(0).setAttribute('value', 'e456A');
    //     expect(doc.getElementsByTagName('id').item(0).getAttribute('value')).toBe('e456A');
    //   })
    //   expect(msg.getXML('/Patient/id@value')).toBe('example');
    // });
    // test('can get path as XML', () => {
    //   expect(msg.get('/Patient/id@value')).toBe('example');
    // });
    // test('', () => {
    //   expect(msg.getXML('/Patient/identifier/value[@value]')).toBe('12345');
    // })
    // test('', () => {
    //   expect(msg.getXML('/Patient/text/div/table/tr[0]td[2]')).toBe('Deceased:');
    // })
    // test('can set and get path', () => {
    //   expect(
    //     msg
    //       .set('Patient.text.div.table.tr[0].td[2]', 'Expired:')
    //       .get('Patient.text.div.table.tr[0].td[2]'),
    //   ).toBe('Expired:');
    // })
    // test('', () => {
    //   expect(msg.set('Patient.id', '456A').get('Patient.id')).toBe('456A');
    // });
    // test('', () => {
    //   expect(
    //     msg
    //       .set(
    //         'Patient.name[0]',
    //         '<use value="official"/><family value="Doe"/><given value="John"/>',
    //         true,
    //       )
    //       .get('Patient.name[0].family'),
    //   ).toBe('Doe');
    // });
  });
});
