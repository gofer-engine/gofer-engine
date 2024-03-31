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
      expect(msg.get(`string(/foo:Patient/foo:id/@value)`, true, { foo: 'http://hl7.org/fhir', bar: 'http://www.w3.org/1999/xhtml' }).toString()).toBe("example");
    });
    test('can get path using auto defined prefixes', () => {
      expect(msg.get(`string(/fhir:Patient/fhir:id/@value)`, true, true).toString()).toBe("example");
    });
    test('can get path removing namespaces', () => {
      expect(msg.get(`string(/Patient/id/@value)`, true, false).toString()).toBe("example");
    });
    // TODO write transformer using xslt template
    // test('can apply XSLT tranformer', () => {
    //   expect(msg.applyXSLT(`<?xml version="1.0"?>
    //     <xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    //       <!-- add some transformation here -->
    //     </xsl:stylesheet>
    //   `).toString()).toBe('')
    // })
    test('can use document api to get element by name and attribute', () => {
      expect(msg.document().getElementsByTagName('id').item(0).getAttribute('value')).toBe('example');
    });
    test('can use document api to get cloned (by default) element by name and set attribute', () => {
      expect(() => msg.document().getElementsByTagName('id').item(0).setAttribute('value', 'foobar')).not.toThrow();
      expect(msg.document().getElementsByTagName('id').item(0).getAttribute('value')).toBe('example');
    });
    test('can use document api to get cloned (by argument) element by name and set attribute', () => {
      expect(() => msg.document(true).getElementsByTagName('id').item(0).setAttribute('value', 'foobar')).not.toThrow();
      expect(msg.document().getElementsByTagName('id').item(0).getAttribute('value')).toBe('example');
    });
    test('can use document api to get referenced element by name and set attribute aka write back', () => {
      expect(() => msg.document(false).getElementsByTagName('id').item(0).setAttribute('value', 'foobar')).not.toThrow();
      expect(msg.document().getElementsByTagName('id').item(0).getAttribute('value')).toBe('foobar');
    });
    test('can get Js by path', () => {
      expect(msg.getJson('/Patient/identifier/value[@value]')).toStrictEqual({ type: 'element', name: 'attributes', elements: [{ type: 'text', name: 'value', text: 12345 }] });
    });
    test('can use setJs method and get updated value', () => {
      expect(
        msg
          .setJs('Patient.id._attributes.value', '456A')
          .get('string(/Patient/id/@value)', true, false).toString()
      ).toBe('456A');
    });
    test('cannot set strict mode', () => {
      msg = new XMLMsg(patient, true);
      expect(msg.strict).toBe(true);
      msg.strict = false;
      expect(msg.strict).toBe(false);
      msg.strict = false;
      expect(msg.strict).toBe(false);
      expect(() => msg.strict = true).toThrow('Cannot set XMLMsg strict mode to true once set to false');
    });
    test('cannot use setCompactJs method in strict mode', () => {
      msg = new XMLMsg(patient, true);
      expect(
        () => msg.setJs('Patient.id._attributes.value', '456A')
      ).toThrow('Cannot use unsafe setJs method on XMLMsg class in strict mode. First set strict parameter to false if you are sure you want to use this method.');
    });
    test('cannot use get without clone and remove namespaces in strict mode', () => {
      msg = new XMLMsg(patient, true);
      expect(
        () => msg.get('string(/Patient/id/@value)', false, false)
      ).toThrow('Cannot use unsafe _removeNamespaces method on XMLMsg class in strict mode. First set strict parameter to false if you are sure you want to use this method.');
    });
    test('set replacing single attribute value string', () => {
      msg.set('/fhir:Patient/fhir:id/@value', '12345', false, true);
      expect(msg.get('string(/fhir:Patient/fhir:id/@value)', true, true).toString()).toBe('12345');
    });
    test('set replacing single attribute value number', () => {
      msg.set('/fhir:Patient/fhir:id/@value', 12345, false, true);
      expect(msg.get('string(/fhir:Patient/fhir:id/@value)', true, true).toString()).toBe('12345');
    });
    test('set replacing attribute records', () => {
      msg.set('/fhir:Patient/fhir:id/@*', { value: '12345' }, false, true);
      expect(msg.get('string(/fhir:Patient/fhir:id/@*)', true, true).toString()).toBe('12345');
    });
    // test('set replacing and adding attribute from records', () => {
    //   msg.set('/fhir:Patient/fhir:id/@*', { value: '12345', foo: 'bar' }, false, true);
    //   expect(msg.get('string(/fhir:Patient/fhir:id/@*)', true, true).toString()).toBe('12345bar');
    // });
  });
});
