import { Sub, Subs, MultiSubs } from './SubComponent';

const sub = new Sub('test');
const subs = new Subs(['foo', 'bar', null]);
const multiSubs = new MultiSubs([
  [new Sub('foo'), new Sub('bar')],
  [new Sub('baz'), new Sub('quaz')],
]);

test('Sub', () => {
  expect(sub.json()).toBe('test');
  expect(sub.json(true)).toStrictEqual({ value: 'test' });
  expect(subs.json()).toStrictEqual(['foo', 'bar', null]);
  expect(subs.json(true)).toStrictEqual([
    { value: 'foo', position: 1 },
    { value: 'bar', position: 2 },
    { value: '', position: 3 },
  ]);
  expect(subs.toString()).toBe('foo&bar&');
  expect(multiSubs.json()).toStrictEqual([
    ['foo', 'bar'],
    ['baz', 'quaz'],
  ]);
  expect(multiSubs.toString()).toStrictEqual('foo&bar^baz&quaz');
});
