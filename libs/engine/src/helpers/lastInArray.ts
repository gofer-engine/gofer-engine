export const lastInArray = <T>(arr: T[]): T => {
  const l = arr.length;
  if (l < 1) throw Error('Cannot get the last item from an empty array.');
  return arr[l - 1];
};
