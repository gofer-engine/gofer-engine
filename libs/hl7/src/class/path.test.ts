import { paths, toPath } from './paths'

test('paths', () => {
  expect(paths()).toStrictEqual({})
})
test('toPath', () => {
  expect(() => toPath({ subComponentPosition: 1 })).toThrowError('Cannot have subComponentPosition without componentPosition')
  expect(() => toPath({ componentPosition: 1 })).toThrowError('Cannot have componentPosition without fieldPosition')
  expect(() => toPath({ fieldPosition: 1 })).toThrowError('Cannot have fieldPosition without segmentName')
  expect(() => toPath({ fieldIteration: 1 })).toThrowError('Cannot have fieldIteration without fieldPosition')
  expect(() => toPath({ segmentIteration: 1 })).toThrowError('Cannot have segmentIteration without segmentName')
  expect(toPath({
    segmentName: 'ZZZ',
    segmentIteration: 1,
    fieldPosition: 1,
    fieldIteration: 1,
    componentPosition: 1,
    subComponentPosition: 1,
  })).toBe('ZZZ[1]-1[1].1.1')
})