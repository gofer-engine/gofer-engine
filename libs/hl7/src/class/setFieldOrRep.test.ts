import Msg from './Message';
import { setFieldOrRep } from './setFieldOrRep';

const msg = new Msg('ZZZ|1\r\nXXX|1');

test('setFieldOrRep', () => {
  expect(
    new Msg(setFieldOrRep(msg.json(), 'ZZZ', 1, 1, () => 'TEST')).get('ZZZ-1')
  ).toBe('TEST');
  expect(
    new Msg(
      setFieldOrRep(msg.json(), 'ZZZ', undefined, 2, [
        { rep: true },
        'foo',
        'bar',
      ])
    ).get('ZZZ-2')
  ).toStrictEqual(['foo', 'bar']);
});
