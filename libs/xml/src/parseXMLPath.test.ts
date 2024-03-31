import { parseXMLPath } from './parseXMLPath';

const cases: [path: string, expected: (string | number)[]][] = [
  ['Patient',['Patient']],
  ['[0]', [0]],
  ['@version', ['@version']],
  ['Patient.id', ['Patient', 'id']],
  ['Patient.id@value', ['Patient', 'id', '@value']],
  ['Patient.id.@value', ['Patient', 'id', '@value']],
  ['Patient[id]@value', ['Patient', 'id', '@value']],
  ['Patient[id].@value', ['Patient', 'id', '@value']],
  ['msg.DG1[1][DG1.1][DG1.1.1]', ['msg', 'DG1', 1, 'DG1.1', 'DG1.1.1']],
  ['msg.DG1[*][DG1.1][DG1.1.1]', ['msg', 'DG1', '*', 'DG1.1', 'DG1.1.1']],
  ['xsl::stylesheet', ['xsl::stylesheet']],
  [
    'xsl::stylesheet.xsl::template.html.body.table.xsl::for-each.tr.td[0]xsl::value-of',
    ['xsl::stylesheet', 'xsl::template', 'html', 'body', 'table', 'xsl::for-each', 'tr', 'td', 0, 'xsl::value-of']
  ],
  ['/Patient', ['Patient']],
  ['/Patient/identifier', ['Patient', 'identifier']],
  ['//identifier', ['//', 'identifier']],
  ['//telecom//value@value', ['//', 'telecom', '//', 'value', '@value']],
];

describe('parseXMLPath', () => {
  test.each(cases)('parse "%s" as `%j`', (input, expected) => {
    expect(parseXMLPath(input)).toEqual(expected);
  });
});
