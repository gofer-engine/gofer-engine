import { OneOrMany } from '../types';

export const decodeRepSep = <
  RepType extends
    | [{ rep: true }, ...(string | null)[]]
    | null
    | undefined
    | string
    | (null | string)[],
  SepType extends OneOrMany<RepType>,
>(
  input: string,
  rep: string | undefined,
  sep: string,
  callback: (
    encoded: string,
    stopChars: string[],
  ) => [input: string, value: SepType],
): [string, ...(OneOrMany<SepType> | null | undefined)[]] => {
  let noRep = false;
  if (rep === undefined) {
    rep = '';
    noRep = true;
  }
  if (input.length === 0) return [input, null];
  input = sep + input;
  const seps: SepType[] = [];
  while (input.startsWith(sep)) {
    input = rep + input.slice(1);
    const reps: RepType[] = [];
    while (noRep || input.startsWith(rep)) {
      if (!noRep) input = input.slice(1);
      const [remaining, val] = callback(input, [sep, rep]);
      input = remaining;
      reps.push(val as unknown as RepType);
      // console.log({ rep, input, val })
      if (noRep) break;
    }
    if (reps.length === 1) {
      seps.push(reps[0] as unknown as SepType);
    } else {
      reps.unshift({ rep: true } as unknown as RepType);
      seps.push(reps as SepType);
    }
  }
  if (seps.length === 1 && typeof seps[0] == 'string') {
    return [input, seps[0]];
  }
  return [input, seps];
};
