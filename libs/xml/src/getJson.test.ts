import fs from 'fs';
import { getJson } from './getJson';
import { parseXMLPath } from './parseXMLPath';
import XMLMsg from '.';
// import { js2xml } from 'xml-js';

const xml = {
  namespacedXML: new XMLMsg(
    fs.readFileSync('./samples/namespaced.xml', 'utf8'),
  ).json(true),
  hl7XML: new XMLMsg(fs.readFileSync('./samples/hl7.xml', 'utf8')).json(true),
  fhirXML: new XMLMsg(fs.readFileSync('./samples/sample.xml', 'utf8')).json(
    true,
  ),
  iheitiXML: new XMLMsg(fs.readFileSync('./samples/ihe.iti.xml', 'utf8')).json(
    true,
  ),
  simpleXML: new XMLMsg(fs.readFileSync('./samples/simple.xml', 'utf8')).json(
    true,
  ),
} as const;

const cases: [path: string, xmlMsg: keyof typeof xml, expected: unknown][] = [
  [
    'Patient.text.div.p',
    'fhirXML',
    {
      attributes: {
        style:
          'border: 1px #661aff solid; background-color: #e6e6ff; padding: 10px;',
      },
      elements: [
        {
          elements: [{ text: ' Jim ', type: 'text' }],
          name: 'b',
          type: 'element',
        },
        {
          text: ' male, DoB: 1974-12-25 ( Medical record number: 12345 (use: USUAL, period:\n  2001-05-06 --> (ongoing)))\n      ',
          type: 'text',
        },
      ],
      name: 'p',
      type: 'element',
    },
  ],
  [
    'Patient.identifier',
    'fhirXML',
    {
      elements: [
        { attributes: { value: 'usual' }, name: 'use', type: 'element' },
        {
          elements: [
            {
              elements: [
                {
                  attributes: {
                    value: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                  },
                  name: 'system',
                  type: 'element',
                },
                { attributes: { value: 'MR' }, name: 'code', type: 'element' },
              ],
              name: 'coding',
              type: 'element',
            },
          ],
          name: 'type',
          type: 'element',
        },
        {
          attributes: { value: 'urn:oid:1.2.36.146.595.217.0.1' },
          name: 'system',
          type: 'element',
        },
        { attributes: { value: '12345' }, name: 'value', type: 'element' },
        {
          elements: [
            {
              attributes: { value: '2001-05-06' },
              name: 'start',
              type: 'element',
            },
          ],
          name: 'period',
          type: 'element',
        },
        {
          elements: [
            {
              attributes: { value: 'Acme Healthcare' },
              name: 'display',
              type: 'element',
            },
          ],
          name: 'assigner',
          type: 'element',
        },
      ],
      name: 'identifier',
      type: 'element',
    },
  ],
  [
    'HL7Message.MSH[MSH.1]',
    'hl7XML',
    { elements: [{ text: '|', type: 'text' }], name: 'MSH.1', type: 'element' },
  ],
  [
    'HL7Message.LAN',
    'hl7XML',
    {
      elements: [
        {
          elements: [
            {
              elements: [
                {
                  elements: [{ text: '1', type: 'text' }],
                  name: 'LAN.1.1',
                  type: 'element',
                },
              ],
              name: 'LAN.1',
              type: 'element',
            },
            {
              elements: [
                {
                  elements: [{ text: 'ESL', type: 'text' }],
                  name: 'LAN.2.1',
                  type: 'element',
                },
                {
                  elements: [{ text: 'SPANISH', type: 'text' }],
                  name: 'LAN.2.2',
                  type: 'element',
                },
                {
                  elements: [{ text: 'ISO639', type: 'text' }],
                  name: 'LAN.2.3',
                  type: 'element',
                },
              ],
              name: 'LAN.2',
              type: 'element',
            },
            {
              elements: [
                {
                  elements: [{ text: '1', type: 'text' }],
                  name: 'LAN.3.1',
                  type: 'element',
                },
                {
                  elements: [{ text: 'READ', type: 'text' }],
                  name: 'LAN.3.2',
                  type: 'element',
                },
                {
                  elements: [{ text: 'HL70403', type: 'text' }],
                  name: 'LAN.3.3',
                  type: 'element',
                },
              ],
              name: 'LAN.3',
              type: 'element',
            },
            {
              elements: [
                {
                  elements: [{ text: '1', type: 'text' }],
                  name: 'LAN.4.1',
                  type: 'element',
                },
                {
                  elements: [{ text: 'EXCELLENT', type: 'text' }],
                  name: 'LAN.4.2',
                  type: 'element',
                },
                {
                  elements: [{ text: 'HL70404', type: 'text' }],
                  name: 'LAN.4.3',
                  type: 'element',
                },
              ],
              name: 'LAN.4',
              type: 'element',
            },
            { name: 'LAN.5', type: 'element' },
          ],
          name: 'LAN',
          type: 'element',
        },
        {
          elements: [
            {
              elements: [
                {
                  elements: [{ text: '2', type: 'text' }],
                  name: 'LAN.1.1',
                  type: 'element',
                },
              ],
              name: 'LAN.1',
              type: 'element',
            },
            {
              elements: [
                {
                  elements: [{ text: 'ESL', type: 'text' }],
                  name: 'LAN.2.1',
                  type: 'element',
                },
                {
                  elements: [{ text: 'SPANISH', type: 'text' }],
                  name: 'LAN.2.2',
                  type: 'element',
                },
                {
                  elements: [{ text: 'ISO639', type: 'text' }],
                  name: 'LAN.2.3',
                  type: 'element',
                },
              ],
              name: 'LAN.2',
              type: 'element',
            },
            {
              elements: [
                {
                  elements: [{ text: '2', type: 'text' }],
                  name: 'LAN.3.1',
                  type: 'element',
                },
                {
                  elements: [{ text: 'WRITE', type: 'text' }],
                  name: 'LAN.3.2',
                  type: 'element',
                },
                {
                  elements: [{ text: 'HL70403', type: 'text' }],
                  name: 'LAN.3.3',
                  type: 'element',
                },
              ],
              name: 'LAN.3',
              type: 'element',
            },
            {
              elements: [
                {
                  elements: [{ text: '2', type: 'text' }],
                  name: 'LAN.4.1',
                  type: 'element',
                },
                {
                  elements: [{ text: 'GOOD', type: 'text' }],
                  name: 'LAN.4.2',
                  type: 'element',
                },
                {
                  elements: [{ text: 'HL70404', type: 'text' }],
                  name: 'LAN.4.3',
                  type: 'element',
                },
              ],
              name: 'LAN.4',
              type: 'element',
            },
            { name: 'LAN.5', type: 'element' },
          ],
          name: 'LAN',
          type: 'element',
        },
        {
          elements: [
            {
              elements: [
                {
                  elements: [{ text: '3', type: 'text' }],
                  name: 'LAN.1.1',
                  type: 'element',
                },
              ],
              name: 'LAN.1',
              type: 'element',
            },
            {
              elements: [
                {
                  elements: [{ text: 'FRE', type: 'text' }],
                  name: 'LAN.2.1',
                  type: 'element',
                },
                {
                  elements: [{ text: 'FRENCH', type: 'text' }],
                  name: 'LAN.2.2',
                  type: 'element',
                },
                {
                  elements: [{ text: 'ISO639', type: 'text' }],
                  name: 'LAN.2.3',
                  type: 'element',
                },
              ],
              name: 'LAN.2',
              type: 'element',
            },
            {
              elements: [
                {
                  elements: [{ text: '3', type: 'text' }],
                  name: 'LAN.3.1',
                  type: 'element',
                },
                {
                  elements: [{ text: 'SPEAK', type: 'text' }],
                  name: 'LAN.3.2',
                  type: 'element',
                },
                {
                  elements: [{ text: 'HL70403', type: 'text' }],
                  name: 'LAN.3.3',
                  type: 'element',
                },
              ],
              name: 'LAN.3',
              type: 'element',
            },
            {
              elements: [
                {
                  elements: [{ text: '3', type: 'text' }],
                  name: 'LAN.4.1',
                  type: 'element',
                },
                {
                  elements: [{ text: 'FAIR', type: 'text' }],
                  name: 'LAN.4.2',
                  type: 'element',
                },
                {
                  elements: [{ text: 'HL70404', type: 'text' }],
                  name: 'LAN.4.3',
                  type: 'element',
                },
              ],
              name: 'LAN.4',
              type: 'element',
            },
            { name: 'LAN.5', type: 'element' },
          ],
          name: 'LAN',
          type: 'element',
        },
      ],
    },
  ],
  [
    'HL7Message.LAN[1]',
    'hl7XML',
    {
      elements: [
        {
          elements: [
            {
              elements: [{ text: '1', type: 'text' }],
              name: 'LAN.1.1',
              type: 'element',
            },
          ],
          name: 'LAN.1',
          type: 'element',
        },
        {
          elements: [
            {
              elements: [{ text: 'ESL', type: 'text' }],
              name: 'LAN.2.1',
              type: 'element',
            },
            {
              elements: [{ text: 'SPANISH', type: 'text' }],
              name: 'LAN.2.2',
              type: 'element',
            },
            {
              elements: [{ text: 'ISO639', type: 'text' }],
              name: 'LAN.2.3',
              type: 'element',
            },
          ],
          name: 'LAN.2',
          type: 'element',
        },
        {
          elements: [
            {
              elements: [{ text: '1', type: 'text' }],
              name: 'LAN.3.1',
              type: 'element',
            },
            {
              elements: [{ text: 'READ', type: 'text' }],
              name: 'LAN.3.2',
              type: 'element',
            },
            {
              elements: [{ text: 'HL70403', type: 'text' }],
              name: 'LAN.3.3',
              type: 'element',
            },
          ],
          name: 'LAN.3',
          type: 'element',
        },
        {
          elements: [
            {
              elements: [{ text: '1', type: 'text' }],
              name: 'LAN.4.1',
              type: 'element',
            },
            {
              elements: [{ text: 'EXCELLENT', type: 'text' }],
              name: 'LAN.4.2',
              type: 'element',
            },
            {
              elements: [{ text: 'HL70404', type: 'text' }],
              name: 'LAN.4.3',
              type: 'element',
            },
          ],
          name: 'LAN.4',
          type: 'element',
        },
        { name: 'LAN.5', type: 'element' },
      ],
      name: 'LAN',
      type: 'element',
    },
  ],
  [
    'HL7Message.LAN[2]',
    'hl7XML',
    {
      elements: [
        {
          elements: [
            {
              elements: [{ text: '2', type: 'text' }],
              name: 'LAN.1.1',
              type: 'element',
            },
          ],
          name: 'LAN.1',
          type: 'element',
        },
        {
          elements: [
            {
              elements: [{ text: 'ESL', type: 'text' }],
              name: 'LAN.2.1',
              type: 'element',
            },
            {
              elements: [{ text: 'SPANISH', type: 'text' }],
              name: 'LAN.2.2',
              type: 'element',
            },
            {
              elements: [{ text: 'ISO639', type: 'text' }],
              name: 'LAN.2.3',
              type: 'element',
            },
          ],
          name: 'LAN.2',
          type: 'element',
        },
        {
          elements: [
            {
              elements: [{ text: '2', type: 'text' }],
              name: 'LAN.3.1',
              type: 'element',
            },
            {
              elements: [{ text: 'WRITE', type: 'text' }],
              name: 'LAN.3.2',
              type: 'element',
            },
            {
              elements: [{ text: 'HL70403', type: 'text' }],
              name: 'LAN.3.3',
              type: 'element',
            },
          ],
          name: 'LAN.3',
          type: 'element',
        },
        {
          elements: [
            {
              elements: [{ text: '2', type: 'text' }],
              name: 'LAN.4.1',
              type: 'element',
            },
            {
              elements: [{ text: 'GOOD', type: 'text' }],
              name: 'LAN.4.2',
              type: 'element',
            },
            {
              elements: [{ text: 'HL70404', type: 'text' }],
              name: 'LAN.4.3',
              type: 'element',
            },
          ],
          name: 'LAN.4',
          type: 'element',
        },
        { name: 'LAN.5', type: 'element' },
      ],
      name: 'LAN',
      type: 'element',
    },
  ],
  [
    'HL7Message.LAN[*]',
    'hl7XML',
    {
      elements: [
        {
          elements: [
            {
              elements: [
                {
                  elements: [{ text: '1', type: 'text' }],
                  name: 'LAN.1.1',
                  type: 'element',
                },
              ],
              name: 'LAN.1',
              type: 'element',
            },
            {
              elements: [
                {
                  elements: [{ text: 'ESL', type: 'text' }],
                  name: 'LAN.2.1',
                  type: 'element',
                },
                {
                  elements: [{ text: 'SPANISH', type: 'text' }],
                  name: 'LAN.2.2',
                  type: 'element',
                },
                {
                  elements: [{ text: 'ISO639', type: 'text' }],
                  name: 'LAN.2.3',
                  type: 'element',
                },
              ],
              name: 'LAN.2',
              type: 'element',
            },
            {
              elements: [
                {
                  elements: [{ text: '1', type: 'text' }],
                  name: 'LAN.3.1',
                  type: 'element',
                },
                {
                  elements: [{ text: 'READ', type: 'text' }],
                  name: 'LAN.3.2',
                  type: 'element',
                },
                {
                  elements: [{ text: 'HL70403', type: 'text' }],
                  name: 'LAN.3.3',
                  type: 'element',
                },
              ],
              name: 'LAN.3',
              type: 'element',
            },
            {
              elements: [
                {
                  elements: [{ text: '1', type: 'text' }],
                  name: 'LAN.4.1',
                  type: 'element',
                },
                {
                  elements: [{ text: 'EXCELLENT', type: 'text' }],
                  name: 'LAN.4.2',
                  type: 'element',
                },
                {
                  elements: [{ text: 'HL70404', type: 'text' }],
                  name: 'LAN.4.3',
                  type: 'element',
                },
              ],
              name: 'LAN.4',
              type: 'element',
            },
            { name: 'LAN.5', type: 'element' },
          ],
          name: 'LAN',
          type: 'element',
        },
        {
          elements: [
            {
              elements: [
                {
                  elements: [{ text: '2', type: 'text' }],
                  name: 'LAN.1.1',
                  type: 'element',
                },
              ],
              name: 'LAN.1',
              type: 'element',
            },
            {
              elements: [
                {
                  elements: [{ text: 'ESL', type: 'text' }],
                  name: 'LAN.2.1',
                  type: 'element',
                },
                {
                  elements: [{ text: 'SPANISH', type: 'text' }],
                  name: 'LAN.2.2',
                  type: 'element',
                },
                {
                  elements: [{ text: 'ISO639', type: 'text' }],
                  name: 'LAN.2.3',
                  type: 'element',
                },
              ],
              name: 'LAN.2',
              type: 'element',
            },
            {
              elements: [
                {
                  elements: [{ text: '2', type: 'text' }],
                  name: 'LAN.3.1',
                  type: 'element',
                },
                {
                  elements: [{ text: 'WRITE', type: 'text' }],
                  name: 'LAN.3.2',
                  type: 'element',
                },
                {
                  elements: [{ text: 'HL70403', type: 'text' }],
                  name: 'LAN.3.3',
                  type: 'element',
                },
              ],
              name: 'LAN.3',
              type: 'element',
            },
            {
              elements: [
                {
                  elements: [{ text: '2', type: 'text' }],
                  name: 'LAN.4.1',
                  type: 'element',
                },
                {
                  elements: [{ text: 'GOOD', type: 'text' }],
                  name: 'LAN.4.2',
                  type: 'element',
                },
                {
                  elements: [{ text: 'HL70404', type: 'text' }],
                  name: 'LAN.4.3',
                  type: 'element',
                },
              ],
              name: 'LAN.4',
              type: 'element',
            },
            { name: 'LAN.5', type: 'element' },
          ],
          name: 'LAN',
          type: 'element',
        },
        {
          elements: [
            {
              elements: [
                {
                  elements: [{ text: '3', type: 'text' }],
                  name: 'LAN.1.1',
                  type: 'element',
                },
              ],
              name: 'LAN.1',
              type: 'element',
            },
            {
              elements: [
                {
                  elements: [{ text: 'FRE', type: 'text' }],
                  name: 'LAN.2.1',
                  type: 'element',
                },
                {
                  elements: [{ text: 'FRENCH', type: 'text' }],
                  name: 'LAN.2.2',
                  type: 'element',
                },
                {
                  elements: [{ text: 'ISO639', type: 'text' }],
                  name: 'LAN.2.3',
                  type: 'element',
                },
              ],
              name: 'LAN.2',
              type: 'element',
            },
            {
              elements: [
                {
                  elements: [{ text: '3', type: 'text' }],
                  name: 'LAN.3.1',
                  type: 'element',
                },
                {
                  elements: [{ text: 'SPEAK', type: 'text' }],
                  name: 'LAN.3.2',
                  type: 'element',
                },
                {
                  elements: [{ text: 'HL70403', type: 'text' }],
                  name: 'LAN.3.3',
                  type: 'element',
                },
              ],
              name: 'LAN.3',
              type: 'element',
            },
            {
              elements: [
                {
                  elements: [{ text: '3', type: 'text' }],
                  name: 'LAN.4.1',
                  type: 'element',
                },
                {
                  elements: [{ text: 'FAIR', type: 'text' }],
                  name: 'LAN.4.2',
                  type: 'element',
                },
                {
                  elements: [{ text: 'HL70404', type: 'text' }],
                  name: 'LAN.4.3',
                  type: 'element',
                },
              ],
              name: 'LAN.4',
              type: 'element',
            },
            { name: 'LAN.5', type: 'element' },
          ],
          name: 'LAN',
          type: 'element',
        },
      ],
      type: 'list',
    },
  ],
  [
    'HL7Message.LAN[1][LAN.1]',
    'hl7XML',
    {
      elements: [
        {
          elements: [{ text: '1', type: 'text' }],
          name: 'LAN.1.1',
          type: 'element',
        },
      ],
      name: 'LAN.1',
      type: 'element',
    },
  ],
  [
    'HL7Message.LAN[2][LAN.1]',
    'hl7XML',
    {
      elements: [
        {
          elements: [{ text: '2', type: 'text' }],
          name: 'LAN.1.1',
          type: 'element',
        },
      ],
      name: 'LAN.1',
      type: 'element',
    },
  ],
  [
    'HL7Message.LAN[*][LAN.1]',
    'hl7XML',
    {
      elements: [
        {
          elements: [
            {
              elements: [{ text: '1', type: 'text' }],
              name: 'LAN.1.1',
              type: 'element',
            },
          ],
          name: 'LAN.1',
          type: 'element',
        },
        {
          elements: [
            {
              elements: [{ text: '2', type: 'text' }],
              name: 'LAN.1.1',
              type: 'element',
            },
          ],
          name: 'LAN.1',
          type: 'element',
        },
        {
          elements: [
            {
              elements: [{ text: '3', type: 'text' }],
              name: 'LAN.1.1',
              type: 'element',
            },
          ],
          name: 'LAN.1',
          type: 'element',
        },
      ],
      type: 'list',
    },
  ],
  [
    'HL7Message.LAN[2][LAN.1][LAN.1.1]',
    'hl7XML',
    {
      elements: [{ text: '2', type: 'text' }],
      name: 'LAN.1.1',
      type: 'element',
    },
  ],
  [
    'HL7Message.LAN[*][LAN.1][LAN.1.1]',
    'hl7XML',
    {
      elements: [
        {
          elements: [{ text: '1', type: 'text' }],
          name: 'LAN.1.1',
          type: 'element',
        },
        {
          elements: [{ text: '2', type: 'text' }],
          name: 'LAN.1.1',
          type: 'element',
        },
        {
          elements: [{ text: '3', type: 'text' }],
          name: 'LAN.1.1',
          type: 'element',
        },
      ],
      type: 'list',
    },
  ],
  [
    'HL7Message.STF[STF.2][1][STF.2.1]',
    'hl7XML',
    {
      elements: [{ text: 'U2246', type: 'text' }],
      name: 'STF.2.1',
      type: 'element',
    },
  ],
  [
    'HL7Message.STF[STF.2][*][STF.2.1]',
    'hl7XML',
    {
      elements: [
        {
          elements: [{ text: 'U2246', type: 'text' }],
          name: 'STF.2.1',
          type: 'element',
        },
        {
          elements: [{ text: '111223333', type: 'text' }],
          name: 'STF.2.1',
          type: 'element',
        },
      ],
      type: 'list',
    },
  ],
  [
    'stylesheet.template.html.body.table//for-each@select',
    'namespacedXML',
    {
      type: 'element',
      name: 'attributes',
      elements: [{ type: 'text', name: 'select', text: 'catalog/cd' }],
    },
  ],
  [
    'stylesheet.template.html.body.table//value-of[*]@select',
    'namespacedXML',
    {
      type: 'list',
      elements: [
        {
          name: 'attributes',
          type: 'element',
          elements: [{ type: 'text', name: 'select', text: 'title' }],
        },
        {
          name: 'attributes',
          type: 'element',
          elements: [{ type: 'text', name: 'select', text: 'artist' }],
        },
      ],
    },
  ],
  [
    'xsl::stylesheet.xsl::template.html.body.table.xsl::for-each.tr.td[*]xsl::value-of',
    'namespacedXML',
    {
      elements: [
        {
          attributes: { select: 'title' },
          name: 'xsl:value-of',
          type: 'element',
        },
        {
          attributes: { select: 'artist' },
          name: 'xsl:value-of',
          type: 'element',
        },
      ],
      type: 'list',
    },
  ],
  [
    '*::stylesheet.xsl::template.html.body.table.xsl::for-each.tr.td[*]xsl::value-of',
    'namespacedXML',
    {
      elements: [
        {
          attributes: { select: 'title' },
          name: 'xsl:value-of',
          type: 'element',
        },
        {
          attributes: { select: 'artist' },
          name: 'xsl:value-of',
          type: 'element',
        },
      ],
      type: 'list',
    },
  ],
  [
    'stylesheet.xsl::template.html.body.table.xsl::for-each.tr.td[*]xsl::value-of',
    'namespacedXML',
    {
      elements: [
        {
          attributes: { select: 'title' },
          name: 'xsl:value-of',
          type: 'element',
        },
        {
          attributes: { select: 'artist' },
          name: 'xsl:value-of',
          type: 'element',
        },
      ],
      type: 'list',
    },
  ],
  [
    '*.xsl::template.html.body.table.xsl::for-each.tr.td[*]xsl::value-of',
    'namespacedXML',
    {
      elements: [
        {
          attributes: { select: 'title' },
          name: 'xsl:value-of',
          type: 'element',
        },
        {
          attributes: { select: 'artist' },
          name: 'xsl:value-of',
          type: 'element',
        },
      ],
      type: 'list',
    },
  ],
  [
    'xsl::*.xsl::template.html.body.table.tr.th',
    'namespacedXML',
    {
      elements: [
        {
          attributes: { style: 'text-align:left' },
          elements: [{ text: 'Title', type: 'text' }],
          name: 'th',
          type: 'element',
        },
        {
          attributes: { style: 'text-align:left' },
          elements: [{ text: 'Artist', type: 'text' }],
          name: 'th',
          type: 'element',
        },
      ],
    },
  ],
  [
    'Patient.id@value',
    'fhirXML',
    {
      elements: [{ name: 'value', text: 'example', type: 'text' }],
      name: 'attributes',
      type: 'element',
    },
  ],
  [
    'Patient.id@*',
    'fhirXML',
    {
      elements: [{ name: 'value', text: 'example', type: 'text' }],
      name: 'attributes',
      type: 'element',
    },
  ],
  [
    '//*',
    'simpleXML',
    {
      elements: [
        {
          elements: [
            {
              elements: [
                {
                  elements: [{ text: 'Item 1', type: 'text' }],
                  name: 'bar',
                  type: 'element',
                },
              ],
              name: 'foo',
              type: 'element',
            },
            {
              elements: [
                {
                  elements: [
                    {
                      elements: [
                        {
                          name: 'bar',
                          type: 'element',
                          elements: [{ type: 'text', text: 'Item 2' }],
                        },
                      ],
                      name: 'other',
                      type: 'element',
                    },
                  ],
                  name: 'foo',
                  type: 'element',
                },
              ],
              name: 'other',
              type: 'element',
            },
          ],
          name: 'root',
          type: 'element',
        },
        {
          elements: [
            {
              elements: [{ text: 'Item 1', type: 'text' }],
              name: 'bar',
              type: 'element',
            },
          ],
          name: 'foo',
          type: 'element',
        },
        {
          elements: [
            {
              elements: [
                {
                  elements: [
                    {
                      elements: [{ type: 'text', text: 'Item 2' }],
                      name: 'bar',
                      type: 'element',
                    },
                  ],
                  name: 'other',
                  type: 'element',
                },
              ],
              name: 'foo',
              type: 'element',
            },
          ],
          name: 'other',
          type: 'element',
        },
        {
          elements: [{ text: 'Item 1', type: 'text' }],
          name: 'bar',
          type: 'element',
        },
        {
          elements: [
            {
              elements: [
                {
                  elements: [{ text: 'Item 2', type: 'text' }],
                  name: 'bar',
                  type: 'element',
                },
              ],
              name: 'other',
              type: 'element',
            },
          ],
          name: 'foo',
          type: 'element',
        },
        {
          elements: [
            {
              elements: [{ text: 'Item 2', type: 'text' }],
              name: 'bar',
              type: 'element',
            },
          ],
          name: 'other',
          type: 'element',
        },
        {
          elements: [{ text: 'Item 2', type: 'text' }],
          name: 'bar',
          type: 'element',
        },
      ],
    },
  ],
  [
    '//foo',
    'simpleXML',
    {
      elements: [
        {
          elements: [
            {
              elements: [{ text: 'Item 1', type: 'text' }],
              name: 'bar',
              type: 'element',
            },
          ],
          name: 'foo',
          type: 'element',
        },
        {
          elements: [
            {
              elements: [
                {
                  elements: [{ text: 'Item 2', type: 'text' }],
                  name: 'bar',
                  type: 'element',
                },
              ],
              name: 'other',
              type: 'element',
            },
          ],
          name: 'foo',
          type: 'element',
        },
      ],
    },
  ],
  [
    '//foo[1]',
    'simpleXML',
    {
      elements: [
        {
          elements: [{ text: 'Item 1', type: 'text' }],
          name: 'bar',
          type: 'element',
        },
      ],
      name: 'foo',
      type: 'element',
    },
  ],
  [
    '//identifier/value@value',
    'fhirXML',
    {
      elements: [{ name: 'value', text: 12345, type: 'text' }],
      name: 'attributes',
      type: 'element',
    },
  ],
  [
    '@version',
    'fhirXML',
    {
      elements: [{ name: 'version', text: 1, type: 'text' }],
      name: 'attributes',
      type: 'element',
    },
  ],
  [
    '@encoding',
    'fhirXML',
    {
      elements: [{ name: 'encoding', text: 'UTF-8', type: 'text' }],
      name: 'attributes',
      type: 'element',
    },
  ],
  [
    '@*',
    'fhirXML',
    {
      elements: [
        { name: 'version', text: 1, type: 'text' },
        { name: 'encoding', text: 'UTF-8', type: 'text' },
      ],
      name: 'attributes',
      type: 'element',
    },
  ],
  [
    'List/identifier[1]value@value',
    'iheitiXML',
    {
      type: 'element',
      name: 'attributes',
      elements: [
        {
          type: 'text',
          name: 'value',
          text: 'urn:uuid:0a468477-5dd1-4a81-bddf-8d5ee9b0cac3',
        },
      ],
    },
  ],
  [
    'List/identifier[*]value@value',
    'iheitiXML',
    {
      type: 'list',
      elements: [
        {
          name: 'attributes',
          type: 'element',
          elements: [
            {
              type: 'text',
              name: 'value',
              text: 'urn:uuid:0a468477-5dd1-4a81-bddf-8d5ee9b0cac3',
            },
          ],
        },
        {
          name: 'attributes',
          type: 'element',
          elements: [
            {
              type: 'text',
              name: 'value',
              text: 'urn:oid:1.2.840.113556.1.8000.2554.58783.21864.3474.19410.44358.58254.41281.46341',
            },
          ],
        },
      ],
    },
  ],
];

describe('getJs', () => {
  test.each(cases)('Can get path: %s', (path, xmlMsg, expected) => {
    const js = getJson(xml[xmlMsg], parseXMLPath(path)) ?? {};
    // console.log(JSON.stringify(js))
    // expect(js2xml(js)).toStrictEqual(expected);
    expect(js).toStrictEqual(expected);
  });
});
