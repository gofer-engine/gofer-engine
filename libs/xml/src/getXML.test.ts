import fs from 'fs';
import { getXML } from './getXML';
import { parseXMLPath } from './parseXMLPath';
import XMLMsg from '.';
import { js2xml } from 'xml-js';

const xml = {
  namespacedXML: new XMLMsg(fs.readFileSync('./samples/namespaced.xml', 'utf8')).json(true),
  hl7XML: new XMLMsg(fs.readFileSync('./samples/hl7.xml', 'utf8')).json(true),
  fhirXML: new XMLMsg(fs.readFileSync('./samples/sample.xml', 'utf8')).json(true),
  iheitiXML: new XMLMsg(fs.readFileSync('./samples/ihe.iti.xml', 'utf8')).json(true),
  simpleXML: new XMLMsg(fs.readFileSync('./samples/simple.xml', 'utf8')).json(true),
} as const;

const cases: [path: string, xmlMsg: keyof typeof xml, expected: string][] = [
  ['Patient.text.div.p', 'fhirXML', '<b> Jim </b> male, DoB: 1974-12-25 ( Medical record number: 12345 (use: USUAL, period:\n  2001-05-06 --&gt; (ongoing)))\n      '],
  ['Patient.identifier', 'fhirXML', '<use value="usual"/><type><coding><system value="http://terminology.hl7.org/CodeSystem/v2-0203"/><code value="MR"/></coding></type><system value="urn:oid:1.2.36.146.595.217.0.1"/><value value="12345"/><period><start value="2001-05-06"/></period><assigner><display value="Acme Healthcare"/></assigner>'],
  ['HL7Message.MSH[MSH.1]', 'hl7XML', '|'],
  ['HL7Message.LAN', 'hl7XML', '<LAN><LAN.1><LAN.1.1>1</LAN.1.1></LAN.1><LAN.2><LAN.2.1>ESL</LAN.2.1><LAN.2.2>SPANISH</LAN.2.2><LAN.2.3>ISO639</LAN.2.3></LAN.2><LAN.3><LAN.3.1>1</LAN.3.1><LAN.3.2>READ</LAN.3.2><LAN.3.3>HL70403</LAN.3.3></LAN.3><LAN.4><LAN.4.1>1</LAN.4.1><LAN.4.2>EXCELLENT</LAN.4.2><LAN.4.3>HL70404</LAN.4.3></LAN.4><LAN.5/></LAN><LAN><LAN.1><LAN.1.1>2</LAN.1.1></LAN.1><LAN.2><LAN.2.1>ESL</LAN.2.1><LAN.2.2>SPANISH</LAN.2.2><LAN.2.3>ISO639</LAN.2.3></LAN.2><LAN.3><LAN.3.1>2</LAN.3.1><LAN.3.2>WRITE</LAN.3.2><LAN.3.3>HL70403</LAN.3.3></LAN.3><LAN.4><LAN.4.1>2</LAN.4.1><LAN.4.2>GOOD</LAN.4.2><LAN.4.3>HL70404</LAN.4.3></LAN.4><LAN.5/></LAN><LAN><LAN.1><LAN.1.1>3</LAN.1.1></LAN.1><LAN.2><LAN.2.1>FRE</LAN.2.1><LAN.2.2>FRENCH</LAN.2.2><LAN.2.3>ISO639</LAN.2.3></LAN.2><LAN.3><LAN.3.1>3</LAN.3.1><LAN.3.2>SPEAK</LAN.3.2><LAN.3.3>HL70403</LAN.3.3></LAN.3><LAN.4><LAN.4.1>3</LAN.4.1><LAN.4.2>FAIR</LAN.4.2><LAN.4.3>HL70404</LAN.4.3></LAN.4><LAN.5/></LAN>'],
  ['HL7Message.LAN[1]', 'hl7XML', '<LAN.1><LAN.1.1>1</LAN.1.1></LAN.1><LAN.2><LAN.2.1>ESL</LAN.2.1><LAN.2.2>SPANISH</LAN.2.2><LAN.2.3>ISO639</LAN.2.3></LAN.2><LAN.3><LAN.3.1>1</LAN.3.1><LAN.3.2>READ</LAN.3.2><LAN.3.3>HL70403</LAN.3.3></LAN.3><LAN.4><LAN.4.1>1</LAN.4.1><LAN.4.2>EXCELLENT</LAN.4.2><LAN.4.3>HL70404</LAN.4.3></LAN.4><LAN.5/>'],
  ['HL7Message.LAN[2]', 'hl7XML', '<LAN.1><LAN.1.1>2</LAN.1.1></LAN.1><LAN.2><LAN.2.1>ESL</LAN.2.1><LAN.2.2>SPANISH</LAN.2.2><LAN.2.3>ISO639</LAN.2.3></LAN.2><LAN.3><LAN.3.1>2</LAN.3.1><LAN.3.2>WRITE</LAN.3.2><LAN.3.3>HL70403</LAN.3.3></LAN.3><LAN.4><LAN.4.1>2</LAN.4.1><LAN.4.2>GOOD</LAN.4.2><LAN.4.3>HL70404</LAN.4.3></LAN.4><LAN.5/>'],
  ['HL7Message.LAN[*]', 'hl7XML', '<LAN><LAN.1><LAN.1.1>1</LAN.1.1></LAN.1><LAN.2><LAN.2.1>ESL</LAN.2.1><LAN.2.2>SPANISH</LAN.2.2><LAN.2.3>ISO639</LAN.2.3></LAN.2><LAN.3><LAN.3.1>1</LAN.3.1><LAN.3.2>READ</LAN.3.2><LAN.3.3>HL70403</LAN.3.3></LAN.3><LAN.4><LAN.4.1>1</LAN.4.1><LAN.4.2>EXCELLENT</LAN.4.2><LAN.4.3>HL70404</LAN.4.3></LAN.4><LAN.5/></LAN><LAN><LAN.1><LAN.1.1>2</LAN.1.1></LAN.1><LAN.2><LAN.2.1>ESL</LAN.2.1><LAN.2.2>SPANISH</LAN.2.2><LAN.2.3>ISO639</LAN.2.3></LAN.2><LAN.3><LAN.3.1>2</LAN.3.1><LAN.3.2>WRITE</LAN.3.2><LAN.3.3>HL70403</LAN.3.3></LAN.3><LAN.4><LAN.4.1>2</LAN.4.1><LAN.4.2>GOOD</LAN.4.2><LAN.4.3>HL70404</LAN.4.3></LAN.4><LAN.5/></LAN><LAN><LAN.1><LAN.1.1>3</LAN.1.1></LAN.1><LAN.2><LAN.2.1>FRE</LAN.2.1><LAN.2.2>FRENCH</LAN.2.2><LAN.2.3>ISO639</LAN.2.3></LAN.2><LAN.3><LAN.3.1>3</LAN.3.1><LAN.3.2>SPEAK</LAN.3.2><LAN.3.3>HL70403</LAN.3.3></LAN.3><LAN.4><LAN.4.1>3</LAN.4.1><LAN.4.2>FAIR</LAN.4.2><LAN.4.3>HL70404</LAN.4.3></LAN.4><LAN.5/></LAN>'],
  ['HL7Message.LAN[1][LAN.1]', 'hl7XML', '<LAN.1.1>1</LAN.1.1>'],
  ['HL7Message.LAN[2][LAN.1]', 'hl7XML', '<LAN.1.1>2</LAN.1.1>'],
  ['HL7Message.LAN[*][LAN.1]', 'hl7XML', '<LAN.1><LAN.1.1>1</LAN.1.1></LAN.1><LAN.1><LAN.1.1>2</LAN.1.1></LAN.1><LAN.1><LAN.1.1>3</LAN.1.1></LAN.1>'],
  ['HL7Message.LAN[2][LAN.1][LAN.1.1]', 'hl7XML', '2'],
  ['HL7Message.LAN[*][LAN.1][LAN.1.1]', 'hl7XML', '<LAN.1.1>1</LAN.1.1><LAN.1.1>2</LAN.1.1><LAN.1.1>3</LAN.1.1>'],
  ['HL7Message.STF[STF.2][1][STF.2.1]', 'hl7XML', 'U2246'],
  ['HL7Message.STF[STF.2][*][STF.2.1]', 'hl7XML', '<STF.2.1>U2246</STF.2.1><STF.2.1>111223333</STF.2.1>'],
  ['xsl::stylesheet.xsl::template.html.body.table.xsl::for-each.tr.td[*]xsl::value-of', 'namespacedXML', '<xsl::value-of select="title"/><xsl::value-of select="artist"/>'],
  ['*::stylesheet.xsl::template.html.body.table.xsl::for-each.tr.td[*]xsl::value-of', 'namespacedXML', '<xsl::value-of select="title"/><xsl::value-of select="artist"/>'],
  ['stylesheet.xsl::template.html.body.table.xsl::for-each.tr.td[*]xsl::value-of', 'namespacedXML', '<xsl::value-of select="title"/><xsl::value-of select="artist"/>'],
  ['*.xsl::template.html.body.table.xsl::for-each.tr.td[*]xsl::value-of', 'namespacedXML', '<xsl::value-of select="title"/><xsl::value-of select="artist"/>'],
  ['xsl::*.xsl::template.html.body.table.tr.th', 'namespacedXML', '<th style="text-align:left">Title</th><th style="text-align:left">Artist</th>'],
  ['Patient.id@value', 'fhirXML', 'example'],
  ['Patient.id@*', 'fhirXML', 'example'],
  ['//*', 'simpleXML', '<root><foo><bar>Item 1</bar></foo><other><foo><other><bar>Item 2</bar></other></foo></other></root><foo><bar>Item 1</bar></foo><other><foo><other><bar>Item 2</bar></other></foo></other><bar>Item 1</bar><foo><other><bar>Item 2</bar></other></foo><other><bar>Item 2</bar></other><bar>Item 2</bar>'],
  ['//foo', 'simpleXML', '<foo><bar>Item 1</bar></foo><foo><other><bar>Item 2</bar></other></foo>'],
  ['//foo[1]', 'simpleXML', '<bar>Item 1</bar>'],
  ['//identifier/value@value', 'fhirXML', '12345'],
  // TODO: see if this should be something other than `attributes` ?
  ['List.identifier.*@foo', 'iheitiXML', '<attributes>1</attributes><attributes>2</attributes>']
];

describe('getXML', () => {
  test.each(cases)('Can get path: %s', (path, xmlMsg, expected) => {
    const js = getXML(xml[xmlMsg], parseXMLPath(path)) ?? {}
    // console.log(JSON.stringify(js))
    expect(js2xml(js)).toBe(expected)
  })
});
