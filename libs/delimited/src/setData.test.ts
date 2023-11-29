import fs from 'fs';
import { DelimitedValue, setData } from './setData';
import { getData } from './getData';

const msg = JSON.parse(fs.readFileSync('./samples/delimited.json', 'utf8'));

const testCases: Record<string, [path: string | undefined, value: DelimitedValue]> = {
  singleCell: ['A0', 'NewFoo'],
  singleRow: ['0', ['NewFoo', 'NewBar', 'NewBaz 42']],
  singleColumn: ['A', [
    'Name',
    'Esmeralda Stark',
    'Kristopher Johnston',
    'Laila Hutchinson',
    'Korbin Jennings',
    'Palmer Kennedy',
    'Maxwell Ortega',
    'Lilah Giles',
    'Kole Rasmussen',
    'Esperanza Wolfe',
    'Donovan Figueroa'
  ]],
  range: ['"Bar"[1]-"Baz 42"[2]', [['42', '43', '44'], ['45', '46', '47']]],
  rowMatrix: ['B5:C6', [['a', 'b'], ['c', 'd']]],
  colMatrix: ['B5|C6', [['a', 'b'], ['c', 'd']]],
  rowMatrixExtended: ['E4:F5', [['a', 'b'], ['c', 'd']]],
  colMatrixExtended: ['E4|F5', [['a', 'b'], ['c', 'd']]],
  rowExtended: ['9+', [['a'],['b'],['c', 'd']]]
};

Object.entries(testCases).forEach(([name, [path, value]]) => {
  test(`setData.${name}`, () => {
    const updated = setData(msg, value, path)
    // console.log(JSON.stringify(updated, undefined, 2));
    // console.log(JSON.stringify(updated, undefined, 2));
    expect(getData(updated, path)).toEqual(value)
  })
})