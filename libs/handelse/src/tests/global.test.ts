import handelse from '../';
import { globalInit } from './global.init';
import { fakeStore, addListeners } from './global.listen.init';

globalInit();
addListeners();

test('global test foo', async () => {
  const handler = handelse.get<string>('global:test1', { eventType: 'string' });
  await handler.pub('foo');
  expect(fakeStore.includes('foo')).toBe(true);
});

test('global test bar', async () => {
  await handelse.go('global:test1', 'bar');
  expect(fakeStore.includes('bar')).toBe(true);
});
