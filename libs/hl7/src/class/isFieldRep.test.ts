import { isFieldRep } from './isFieldRep';

test('isFieldRep', () => {
  expect(isFieldRep('')).toBeFalsy();
  expect(isFieldRep([])).toBeFalsy();
  expect(isFieldRep([[]])).toBeFalsy();
  expect(isFieldRep([null])).toBeFalsy();
  expect(isFieldRep(['', ''])).toBeFalsy();
  expect(isFieldRep([{}, ''] as never)).toBeFalsy();
  expect(isFieldRep([{ rep: false }, ''] as never)).toBeFalsy();
  expect(isFieldRep([{ rep: true }, ''])).toBeTruthy();
});
