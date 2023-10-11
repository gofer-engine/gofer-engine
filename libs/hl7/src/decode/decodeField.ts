import { FieldOrRep, MessageMeta } from '../types';
import { decodeComponent } from './decodeComponent';
import { decodeRepSep } from './decodeRepSep';
import { findCharsFirstPos } from './findCharsFirstPos';

export const decodeField = (
  input: string,
  stopChars: string[],
  meta: MessageMeta,
): [
  remaining: string,
  // value: OneOrMany<OneOrMany<string> | null | undefined>
  value: FieldOrRep,
] => {
  const i = findCharsFirstPos(input, stopChars);
  const [, val] = decodeRepSep(
    input.slice(0, i),
    undefined,
    meta.encodingCharacters.componentSep,
    (input, stCh) => decodeComponent(input, [...stopChars, ...stCh], meta),
  );
  input = input.slice(i);
  return [input, val];
};
