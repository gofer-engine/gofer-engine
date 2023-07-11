import Msg, { Seg } from './';

test('Msg', () => {
  expect(() => new Msg().setJSON('MSH', 'MSH')).toThrowError(
    'The json was not a valid HL7 JSON.'
  );
  expect(new Msg().setJSON('MSH', ['MSH', '|', '^~\\&']).get('MSH-1')).toBe(
    '|'
  );
  expect(() => new Msg().addSegment('')).toThrowError('Could not addSegment');
  expect(new Msg().set('MSH-3', null).get('MSH-3')).toBeNull();
  expect(new Msg('').get(undefined)).toBeInstanceOf(Array);
  expect(new Msg('MSH|^~\\&|t').map('MSH-3', 'TEST').get('MSH-3')).toBe('TEST');
});
