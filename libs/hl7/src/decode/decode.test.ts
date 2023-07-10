import decode, { findCharsFirstPos } from './';

test('decode', () => {
  expect(decode('')).toBeUndefined();
  expect(() => decode('MSH')).toThrowError(
    'Invalid encoding characters: {"fieldSep":""}'
  );
  expect(decode('ZZZ|1')?.[0].encodingCharacters).toStrictEqual({
    componentSep: '^',
    escapeChar: '\\',
    fieldSep: '|',
    repetitionSep: '~',
    subComponentSep: '&',
    truncateChar: undefined,
  });
  expect(() => decode('AB|1')).toThrowError('Expected segment name, got AB|1');
  expect(() => decode('MSH|^')).toThrowError('Expected array of fields');
  expect(decode('PID')?.[1]).toStrictEqual([['PID']]);
});
test('findCharsFirstPos', () => {
  expect(() => findCharsFirstPos('', ['$^'])).toThrowError('stop character is too long, expected 1 character')
})
