/* eslint-disable @typescript-eslint/no-unused-vars */
import * as fs from 'fs';
import Msg from './Message';

const HL7 = fs.readFileSync('./samples/sample.hl7', 'utf8');

const msg = new Msg(HL7);

msg
  .transform({
    restrict: {
      MSH: () => true,
      LAN: 3,
      ZZZ: {
        1: true,
        2: [1, 5],
      },
      STF: {
        2: [1, 4],
        3: [],
        4: [2],
        5: true,
        10: 1,
        11: (f) => f?.[5] === 'O', // f is 0-indexed. This is actually looking at STF-11.6
      },
      EDU: true,
    },
    remove: {
      LAN: 2,
      EDU: {
        1: true,
        2: [3],
        3: (f) => {
          if (Array.isArray(f) && typeof f[0] === 'string')
            return f[0] > '19820000';
          return false;
        },
        4: 2,
      },
      ZZZ: true,
    },
  })
  .addSegment('ZZZ|Engine|gofer');

const expected = `MSH|^~\\&|HL7REG|UH|HL7LAB|CH|200702280700||PMU^B01^PMU_B01|MSGID002|P|2.5.1|
STF||U2246^^^PLW~111223333^^^USSSA|||M|||||(555)555-1003X345^C^O|3029 HEALTHCARE DRIVE^^ANNARBOR^MI^98198^O|||||
LAN|1|ESL^SPANISH^ISO639|1^READ^HL70403|1^EXCELLENT^HL70404|
EDU||BA^BACHELOR OF ARTS|19810901^19850601|YALE UNIVERSITY^L|U^HL70402|456 CONNECTICUT AVENUE^^NEW HAVEN^CO^87654^U.S.A.^M|
EDU||MD^DOCTOR OF MEDICINE||HARVARD MEDICAL SCHOOL^L |M^HL70402|123 MASSACHUSETTS AVENUE^CAMBRIDGE^MA^76543^U.S.A.^M|
ZZZ|Engine|gofer`;

test('Transformers', () => {
  expect(msg.toString()).toBe(expected);
});

test('Set Developer ZZZ', () => {
  msg.set('ZZZ', 'ZZZ|Developer|amaster507^github.com');
  expect(msg.getSegment('ZZZ').toString()).toBe(
    'ZZZ|Developer|amaster507^github.com'
  );
});

test('Set Sending App MSH.3', () => {
  msg.set('MSH.3', 'GOFER');
  expect(msg.getSegment('MSH').toString()).toBe(
    'MSH|^~\\&|GOFER|UH|HL7LAB|CH|200702280700||PMU^B01^PMU_B01|MSGID002|P|2.5.1|'
  );
});

test('Copy Path', () => {
  expect(msg.copy('ZZZ-1', 'ZZZ-3').get('ZZZ-3')).toBe('Developer');
});

test('Move Path', () => {
  msg.move('ZZZ-3', 'ZZZ-4');
  expect(msg.get('ZZZ-3')).toBe(null);
  expect(msg.get('ZZZ-4')).toBe('Developer');
});

test('Map LAN-2.2', () => {
  expect(
    msg
      .map('LAN-2.2', {
        ENGLISH: 'English',
        SPANISH: 'Spanish',
        FRENCH: 'French',
      })
      .get('LAN-2.2')
  ).toBe('Spanish');
});

test('Map LAN-4', () => {
  expect(
    msg
      .map('LAN-4', <T>(field: T): T => {
        if (Array.isArray(field) && field.length > 1) {
          return (
            typeof field[1] === 'string' ? field[1].toUpperCase() : null
          ) as T;
        }
        return null as T;
      })
      .get('LAN-4')
  ).toStrictEqual('EXCELLENT');
});

test('Set LAN-4 Raw', () => {
  expect(
    msg.setJSON('LAN-4', ['3', 'FAIR', 'HL70404']).get('LAN-4')
  ).toStrictEqual(['3', 'FAIR', 'HL70404']);
});

test('Set Iteration', () => {
  msg
    .delete('LAN')
    .addSegment('LAN|9|ESL^SPANISH^ISO639|1^READ^HL70403~1^EXCELLENT^HL70404|')
    .addSegment('LAN|8|ESL^SPANISH^ISO639|2^WRITE^HL70403~2^GOOD^HL70404|')
    .addSegment('LAN|7|FRE^FRENCH^ISO639|3^SPEAK^HL70403~3^FAIR^HL70404|')
    .map(
      'LAN-1',
      (_v, i) => {
        return i.toString() as typeof _v;
      },
      { iteration: true }
    );
  expect(msg.get('LAN-1')).toEqual(['1', '2', '3']);
});

test('Set Iteration with looping array', () => {
  msg
    .delete('LAN')
    .addSegment('LAN|1|ESL^SPANISH^ISO639|1^READ^HL70403~1^EXCELLENT^HL70404|')
    .addSegment('LAN|1|ESL^SPANISH^ISO639|2^WRITE^HL70403~2^GOOD^HL70404|')
    .addSegment('LAN|1|FRE^FRENCH^ISO639|3^SPEAK^HL70403~3^FAIR^HL70404|');
  msg.setIteration<string>('LAN-1', ['A', 'B'], { allowLoop: true });
  expect(msg.get('LAN-1')).toStrictEqual(['A', 'B', 'A']);
});

test('Set Iteration without looping array', () => {
  msg
    .delete('LAN')
    .addSegment('LAN|1|ESL^SPANISH^ISO639|1^READ^HL70403~1^EXCELLENT^HL70404|')
    .addSegment('LAN|1|ESL^SPANISH^ISO639|2^WRITE^HL70403~2^GOOD^HL70404|')
    .addSegment('LAN|1|FRE^FRENCH^ISO639|3^SPEAK^HL70403~3^FAIR^HL70404|');
  msg.setIteration<string>('LAN-1', ['9', '8']);
  expect(msg.get('LAN-1')).toStrictEqual(['9', '8', undefined]);
});

test('Set Iteration', () => {
  msg
    .delete('LAN')
    .addSegment(
      'LAN|1|ESL^SPANISH^ISO639|1^READ^HL70403~1^EXCELLENT^HL70404|',
      'STF'
    )
    .addSegment('LAN|1|ESL^SPANISH^ISO639|2^WRITE^HL70403~2^GOOD^HL70404|', 3)
    .addSegment(
      'LAN|1|FRE^FRENCH^ISO639|3^SPEAK^HL70403~3^FAIR^HL70404|',
      'MSH:STF[1]:LAN[2]'
    );
  msg.setIteration<string>('LAN-1', (_v, i) => {
    return i.toString();
  });
  expect(msg.get('LAN-1')).toStrictEqual(['1', '2', '3']);
  expect(msg.getSegments().map((seg) => seg.getName())).toStrictEqual([
    'MSH',
    'STF',
    'LAN',
    'LAN',
    'LAN',
    'EDU',
    'EDU',
    'ZZZ',
  ]);
});
