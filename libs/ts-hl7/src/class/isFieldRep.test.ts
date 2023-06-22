import { isFieldRep } from './isFieldRep'

test('isFieldRep', () => {
  expect(isFieldRep('')).toBeFalsy()
  expect(isFieldRep([])).toBeFalsy()
  expect(isFieldRep([[]])).toBeFalsy()
  expect(isFieldRep([null])).toBeFalsy()
  expect(isFieldRep(['', ''])).toBeFalsy()
  expect(isFieldRep([{  }, ''] as any)).toBeFalsy()
  expect(isFieldRep([{ rep: false }, ''] as any)).toBeFalsy()
  expect(isFieldRep([{ rep: true }, ''])).toBeTruthy()
})