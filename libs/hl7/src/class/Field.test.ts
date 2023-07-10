import { FieldRep } from '../types';
import { Fld, Flds } from './Field';

const fieldJSON: FieldRep = [
  { rep: true },
  [['A', '1'], 'foo'],
  [['B', '2'], 'bar'],
  'C',
];
const repField = new Fld(fieldJSON);

const fields = new Flds([repField, repField]);

test('Field', () => {
  expect(repField.toString()).toBe('A&1^foo~B&2^bar~C');
  expect(repField.json()).toStrictEqual(fieldJSON);
  expect(repField.getComponents().map((cmp) => cmp.toString())).toStrictEqual([
    'A&1',
    'foo',
    'B&2',
    'bar',
    'C',
  ]);
  expect(fields.toString()).toBe('A&1^foo~B&2^bar~C|A&1^foo~B&2^bar~C');
  expect(new Fld(null).getComponent().toString()).toBeNull();
  expect(new Fld('').getComponent().toString()).toBe('');
  expect(repField.getComponent(2).toString()).toStrictEqual([
    'foo',
    'bar',
    null,
  ]);
  expect(fields.getComponent(3).toString()).toStrictEqual([
    null,
    null,
    null,
    null,
    null,
    null,
  ]);
  expect(new Flds([]).getComponent().toString()).toBe(null);
  expect(new Flds([new Fld(null)]).getComponent().toString()).toBe(null);
  expect(new Flds([]).getComponents().toString()).toStrictEqual([]);
  expect(new Flds([new Fld(null)]).getComponents().toString()).toStrictEqual([
    null,
  ]);
  expect(
    new Flds([new Fld(null), new Fld(null)]).getComponents().toString()
  ).toStrictEqual([null, null]);
  expect(new Flds([]).one()).toBeUndefined();
  expect(new Flds([new Fld(null)]).json()).toStrictEqual([null]);
  expect(new Flds([new Fld(null)]).json(true)).toStrictEqual([
    {
      position: 1,
      repetitions: [
        {
          components: [
            {
              position: 1,
              subComponents: [{ position: 1, value: '' }],
              value: '',
            },
          ],
          position: 1,
          value: '',
        },
      ],
      value: '',
    },
  ]);
});
