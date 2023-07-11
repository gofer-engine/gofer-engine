export const findCharsFirstPos = (input: string, chars: string[]): number => {
  return Math.min(
    ...chars
      .filter((c) => {
        if (c.length > 1)
          throw new Error('stop character is too long, expected 1 character');
        return c.length > 0;
      })
      .map((c) => input.indexOf(c))
      .filter((i) => i !== -1)
  );
};
