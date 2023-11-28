import { AlphaIndex, parsePath } from './parsePath';

const headers = ['Column 0', 'Column 1', 'me', 'Column 3', 'Column 45'];

test('AlphaIndex', () => {
  expect(AlphaIndex('A')).toEqual(0);
  expect(AlphaIndex('B')).toEqual(1);
  expect(AlphaIndex('Z')).toEqual(25);
  expect(AlphaIndex('AA')).toEqual(26);
  expect(AlphaIndex('AB')).toEqual(27);
  expect(AlphaIndex('AZ')).toEqual(51);
  expect(AlphaIndex('BA')).toEqual(52);
  expect(AlphaIndex('AAA')).toEqual(702);
})

test('parsePath single row', () => {
  expect(parsePath('1')).toEqual({ row: 1 });
  expect(parsePath('[1]')).toEqual({ row: 1 });
  expect(parsePath('0')).toEqual({ row: 0 });
  expect(parsePath('100')).toEqual({ row: 100 });
});

test('parsePath single column', () => {
  expect(parsePath('A')).toEqual({ column: 0 });
  expect(parsePath('B')).toEqual({ column: 1 });
  expect(parsePath('b')).toEqual({ column: 1 });
  expect(parsePath('AA')).toEqual({ column: 26 });
  expect(parsePath('aa')).toEqual({ column: 26 });
  expect(parsePath('"Column 1"', headers)).toEqual({ column: 1 });
});

test('parsePath row ranges', () => {
  expect(parsePath('10>50')).toEqual({ row: [11, 49] });
  expect(parsePath('20-40')).toEqual({ row: [20, 40] });
  expect(parsePath('<40')).toEqual({ row: [0, 39] });
  expect(parsePath('>50')).toEqual({ row: [51] });
  expect(parsePath('-20')).toEqual({ row: -20 });
  expect(parsePath('20+')).toEqual({ row: [20] });
  expect(() => parsePath('50-10')).toThrow();;
});

test('parsePath cells', () => {
  expect(parsePath(`A[1]`)).toEqual({ column: 0, row: 1 });
  expect(parsePath(`aa[10]`)).toEqual({ column: 26, row: 10 });
  expect(parsePath(`c.1`)).toEqual({ column: 2, row: 1 });
  expect(parsePath(`Z.15`)).toEqual({ column: 25, row: 15 });
  expect(parsePath(`[1].AZ`)).toEqual({ column: 51, row: 1 });
  expect(parsePath(`"Column 1"[1]`, headers)).toEqual({ column: 1, row: 1 });
  expect(parsePath(`'Column 1'[1]`, headers)).toEqual({ column: 1, row: 1 });
  expect(parsePath(`"Column 1".1`, headers)).toEqual({ column: 1, row: 1 });
  expect(parsePath(`'Column 1'.1`, headers)).toEqual({ column: 1, row: 1 });
  expect(parsePath(`[1]."Column 1"`, headers)).toEqual({ column: 1, row: 1 });
  expect(parsePath(`[1].'Column 1'`, headers)).toEqual({ column: 1, row: 1 });
  expect(parsePath(`100.AB`)).toEqual({ column: 27, row: 100 });
  expect(parsePath(`250."Column 45"`, headers)).toEqual({ column: 4, row: 250 });
  expect(parsePath(`10['me']`, headers)).toEqual({ column: 2, row: 10 });
  expect(parsePath(`[45][ZA]`)).toEqual({ column: 676, row: 45 });
  expect(parsePath(`[45]["Column 3"]`, headers)).toEqual({ column: 3, row: 45 });
  expect(parsePath(`4"me"`, headers)).toEqual({ column: 2, row: 4 });
  expect(parsePath(`4AA`)).toEqual({ column: 26, row: 4 });
})

test('parsePath cell ranges', () => {
  expect(parsePath(`A[1]:B[2]`)).toEqual({ column: [0, 1], row: [1, 2], matrix: 'row' });
  expect(parsePath(`aa[10]:b[4]`)).toEqual({ column: [1, 26], row: [4, 10], matrix: 'row' });
  expect(parsePath(`A1:B5`)).toEqual({ column: [0, 1], row: [1, 5], matrix: 'row' });
  expect(parsePath(`a.1:B5`)).toEqual({ column: [0, 1], row: [1, 5], matrix: 'row' });
  expect(parsePath(`Z.15:Z.15`)).toEqual({ column: [25, 25], row: [15, 15], matrix: 'row' });
  expect(parsePath(`[1].AZ:[1].AZ`)).toEqual({ column: [51, 51], row: [1, 1], matrix: 'row' });
  expect(parsePath(`"Column 1"[1]:"Column 1"[1]`, headers)).toEqual({ column: [1, 1], row: [1, 1], matrix: 'row' });
  expect(parsePath(`'Column 1'[1]:'Column 1'[1]`, headers)).toEqual({ column: [1, 1], row: [1, 1], matrix: 'row' });
  expect(parsePath(`"Column 1".1:"Column 1".1`, headers)).toEqual({ column: [1, 1], row: [1, 1], matrix: 'row' });
  expect(parsePath(`'Column 1'.1:'Column 1'.1`, headers)).toEqual({ column: [1, 1], row: [1, 1], matrix: 'row' });
  expect(parsePath(`[1]."Column 1":[1]."Column 1"`, headers)).toEqual({ column: [1, 1], row: [1, 1], matrix: 'row' });
  expect(parsePath(`[1].'Column 1':[1].'Column 1'`, headers)).toEqual({ column: [1, 1], row: [1, 1], matrix: 'row' });
  expect(parsePath(`100.AB:100.AB`)).toEqual({ column: [27, 27], row: [100, 100], matrix: 'row' });
  expect(parsePath(`250."Column 45":250."Column 45"`, headers)).toEqual({ column: [4, 4], row: [250, 250], matrix: 'row' });
  expect(parsePath(`10['me']:10['me']`, headers)).toEqual({ column: [2, 2], row: [10, 10], matrix: 'row' });
  expect(parsePath(`[45][ZA]:[45][ZA]`)).toEqual({ column: [676, 676], row: [45, 45], matrix: 'row' });
  expect(parsePath(`4"me":4"me"`, headers)).toEqual({ column: [2, 2], row: [4, 4], matrix: 'row' });
  expect(parsePath(`4AA:4AA`)).toEqual({ column: [26, 26], row: [4, 4], matrix: 'row' });
  expect(parsePath(`A[1]|A[1]`)).toEqual({ column: [0, 0], row: [1, 1], matrix: 'column' });
  expect(parsePath(`aa[10]|aa[10]`)).toEqual({ column: [26, 26], row: [10, 10], matrix: 'column' });
  expect(parsePath(`a.1|a.1`)).toEqual({ column: [0, 0], row: [1, 1], matrix: 'column' });
  expect(parsePath(`Z.15|Z.15`)).toEqual({ column: [25, 25], row: [15, 15], matrix: 'column' });
  expect(parsePath(`[1].AZ|[1].AZ`)).toEqual({ column: [51, 51], row: [1, 1], matrix: 'column' });
  expect(parsePath(`"Column 1"[1]|"Column 1"[1]`, headers)).toEqual({ column: [1, 1], row: [1, 1], matrix: 'column' });
  expect(parsePath(`'Column 1'[1]|'Column 1'[1]`, headers)).toEqual({ column: [1, 1], row: [1, 1], matrix: 'column' });
  expect(parsePath(`"Column 1".1|"Column 1".1`, headers)).toEqual({ column: [1, 1], row: [1, 1], matrix: 'column' });
  expect(parsePath(`'Column 1'.1|'Column 1'.1`, headers)).toEqual({ column: [1, 1], row: [1, 1], matrix: 'column' });
  expect(parsePath(`[1]."Column 1"|[1]."Column 1"`, headers)).toEqual({ column: [1, 1], row: [1, 1], matrix: 'column' });
  expect(parsePath(`[1].'Column 1'|[1].'Column 1'`, headers)).toEqual({ column: [1, 1], row: [1, 1], matrix: 'column' });
  expect(parsePath(`100.AB|100.AB`)).toEqual({ column: [27, 27], row: [100, 100], matrix: 'column' });
  expect(parsePath(`250."Column 45"|250."Column 45"`, headers)).toEqual({ column: [4, 4], row: [250, 250], matrix: 'column' });
  expect(parsePath(`20['me']|10['Column 1']`, headers)).toEqual({ column: [1, 2], row: [10, 20], matrix: 'column' });
  expect(parsePath(`[45][ZA]|[45][ZA]`)).toEqual({ column: [676, 676], row: [45, 45], matrix: 'column' });
  expect(parsePath(`4"me"|4"me"`, headers)).toEqual({ column: [2, 2], row: [4, 4], matrix: 'column' });
  expect(parsePath(`4AA|4AA`)).toEqual({ column: [26, 26], row: [4, 4], matrix: 'column' });
  expect(parsePath(`A[1]-A[1]`)).toEqual({ column: [0, 0], row: [1, 1] });
  expect(parsePath(`aa[10]-aa[10]`)).toEqual({ column: [26, 26], row: [10, 10] });
  expect(parsePath(`a.1-a.1`)).toEqual({ column: [0, 0], row: [1, 1] });
  expect(parsePath(`Z.15-Z.15`)).toEqual({ column: [25, 25], row: [15, 15] });
  expect(parsePath(`[1].AZ-[1].AZ`)).toEqual({ column: [51, 51], row: [1, 1] });
  expect(parsePath(`"Column 1"[1]-"Column 1"[1]`, headers)).toEqual({ column: [1, 1], row: [1, 1] });
  expect(parsePath(`'Column 1'[1]-'Column 1'[1]`, headers)).toEqual({ column: [1, 1], row: [1, 1] });
  expect(parsePath(`"Column 1".1-"Column 1".1`, headers)).toEqual({ column: [1, 1], row: [1, 1] });
  expect(parsePath(`'Column 1'.1-'Column 1'.1`, headers)).toEqual({ column: [1, 1], row: [1, 1] });
  expect(parsePath(`[1]."Column 1"-[1]."Column 1"`, headers)).toEqual({ column: [1, 1], row: [1, 1] });
  expect(parsePath(`[1].'Column 1'-[1].'Column 1'`, headers)).toEqual({ column: [1, 1], row: [1, 1] });
  expect(parsePath(`100.AB-100.AB`)).toEqual({ column: [27, 27], row: [100, 100] });
  expect(parsePath(`250."Column 45"-250."Column 45"`, headers)).toEqual({ column: [4, 4], row: [250, 250] });
  expect(parsePath(`10['me']-10['me']`, headers)).toEqual({ column: [2, 2], row: [10, 10] });
  expect(parsePath(`[45][ZA]-[45][ZA]`)).toEqual({ column: [676, 676], row: [45, 45] });
  expect(parsePath(`4"me"-4"me"`, headers)).toEqual({ column: [2, 2], row: [4, 4] });
  expect(parsePath(`4AA-4AA`)).toEqual({ column: [26, 26], row: [4, 4] });
});

test.skip('parsePath column ranges', () => {
  expect(parsePath(`'D|F`)).toEqual({ column: [3, 5], matrix: 'column' });
});
  
  