import { SubComponent } from '../types';
import { findCharsFirstPos } from './findCharsFirstPos';

export const decodeSubComponent = (
  input: string,
  sc: string[]
): [remaining: string, value: SubComponent] => {
  const i = findCharsFirstPos(input, sc);
  const sliced = input.slice(0, i);
  const val = sliced === '' ? null : sliced;
  return [input.slice(i), val];
};
