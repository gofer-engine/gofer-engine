import fs from 'fs';
import { insertColumns } from './insertColumns';

// need some delimited parsed data to test
const msg = JSON.parse(fs.readFileSync('./samples/delimited.json', 'utf8'));

const testCases: Record<string, [index: number, columns: string[][], expected: string[][]]> = {
  noColumns: [
    0,
    [],
    [
      ["Foo", "Bar", "Baz 42"],
      ["1", "2", "3"],
      ["4", "5", "6", "7"],
      ["8", "9"],
      ["10", "11", "12"],
      ["13", "14", "15"],
      ["16", "17", "18"],
      ["19", "20", "21"],
      ["22", "23", "24"],
      ["25", "26", "27"],
      ["28", "29", "30"]
    ]
  ],
  firstColumns: [
    0,
    [['Zero']],
    [
      ["Zero", "Foo", "Bar", "Baz 42"],
      ["", "1", "2", "3"],
      ["", "4", "5", "6", "7"],
      ["", "8", "9"],
      ["", "10", "11", "12"],
      ["", "13", "14", "15"],
      ["", "16", "17", "18"],
      ["", "19", "20", "21"],
      ["", "22", "23", "24"],
      ["", "25", "26", "27"],
      ["", "28", "29", "30"]
    ]
  ],
  twoColumns: [
    2,
    [
      ['Third', 'a', 'b', 'c', 'd'],
      ['Fourth', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o']
    ],
    [
      ["Foo", "Bar", "Third", "Fourth", "Baz 42"],
      ["1", "2", "a", "e", "3"],
      ["4", "5", "b", "f", "6", "7"],
      ["8", "9", "c", "g"],
      ["10", "11", "d", "h", "12"],
      ["13", "14", "", "i", "15"],
      ["16", "17", "", "j", "18"],
      ["19", "20", "", "k", "21"],
      ["22", "23", "", "l", "24"],
      ["25", "26", "", "m", "27"],
      ["28", "29", "", "n", "30"],
      ["", "", "", "o"],
    ]
  ]
};

describe('insertColumns', () => {
  Object.entries(testCases).forEach(([name, [index, columns, expected]]) => {
    it(name, () => {
      const actual = insertColumns(msg, index, columns);
      expect(actual).toEqual(expected);
    });
  });
});
