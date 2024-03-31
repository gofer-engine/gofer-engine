import fs from 'fs';
import { getData } from './getData';

// need some delimited parsed data to test
const msg = JSON.parse(fs.readFileSync('./samples/delimited.json', 'utf8'));

const testCases: Record<string, undefined | string | string[] | string[][]> = {
  A0: 'Foo',
  B0: 'Bar',
  C0: 'Baz 42',
  D0: undefined,
  0: ['Foo', 'Bar', 'Baz 42'],
  '[1]': ['1', '2', '3'],
  2: ['4', '5', '6', '7'],
  3: ['8', '9'],
  A: ['Foo', '1', '4', '8', '10', '13', '16', '19', '22', '25', '28'],
  D: ['', '', '7', '', '', '', '', '', '', '', ''],
  "'Bar'": ['Bar', '2', '5', '9', '11', '14', '17', '20', '23', '26', '29'],
  '"Bar".1': '2',
  B1: '2',
  '1A': '1',
  '"Baz 42"[3]': undefined,
  '"Baz 42"[4]': '12',
  '1-2': [
    ['1', '2', '3'],
    ['4', '5', '6', '7'],
  ],
  'A0-A0': [['Foo']],
  'B1-C2': [
    ['2', '3'],
    ['4', '5', '6'],
  ],
  'B1:C2': [
    ['2', '3'],
    ['5', '6'],
  ],
  'B1|C2': [
    ['2', '5'],
    ['3', '6'],
  ],
  'B1|C4': [
    ['2', '5', '9', '11'],
    ['3', '6', '', '12'],
  ],
  'A0-C10': msg,
  '-2': [
    ['25', '26', '27'],
    ['28', '29', '30'],
  ],
  '>8': [
    ['25', '26', '27'],
    ['28', '29', '30'],
  ],
  '9+': [
    ['25', '26', '27'],
    ['28', '29', '30'],
  ],
  '9-10': [
    ['25', '26', '27'],
    ['28', '29', '30'],
  ],
  '<2': [
    ['Foo', 'Bar', 'Baz 42'],
    ['1', '2', '3'],
  ],
};

Object.entries(testCases).forEach(([path, expected]) => {
  test(`getData.${path}`, () => {
    expect(getData(msg, path)).toEqual(expected);
  });
});
