import * as fs from 'fs';

import { findSegmentInMsg } from './findSegmentPos';
import Msg from './Message';

const PMU = new Msg(fs.readFileSync('./samples/sample.hl7', 'utf8'));

const OUL = new Msg(fs.readFileSync('./samples/sample2.hl7', 'utf8'));

test('find MSH', () => {
  expect(findSegmentInMsg(PMU.json(), 'MSH')).toBe(0);
});

test('find EVN', () => {
  expect(findSegmentInMsg(PMU.json(), 'EVN')).toBe(1);
});

test('find LAN[2]', () => {
  expect(findSegmentInMsg(PMU.json(), 'LAN[2]')).toBe(6);
});

test('find SPM', () => {
  expect(findSegmentInMsg(OUL.json(), 'SPM')).toBe(2);
});

test('find SPM:OBR', () => {
  expect(findSegmentInMsg(OUL.json(), 'SPM:OBR')).toBe(4);
});

test('find SPM:OBR:OBX:TCD', () => {
  expect(findSegmentInMsg(OUL.json(), 'SPM:OBR:OBX[2]:TCD')).toBe(9);
});

test('find SPM:OBR:OBX:TCD', () => {
  expect(findSegmentInMsg(OUL.json(), 'SPM:OBR:OBX[4]')).toBe(13);
});

test('find SPM:OBR:OBX:TCD', () => {
  let error = undefined;
  try {
    findSegmentInMsg(OUL.json(), 'SPM:OBR:OBX:TCD');
  } catch (e) {
    error = (e as { message: string }).message;
  }
  expect(error).toBe(
    `Could not find TCD[1] with stop keys ["OBX","TCD","INV","INV","OBX","OBX","OBX","OBX","OBX","OBX","OBX","ZZZ"] but not in ["SPM","OBR","OBX"]`,
  );
});
