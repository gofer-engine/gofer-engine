export const flattenSingleArrayItem = <T>(arr: T | T[]): T | T[] => {
  if (Array.isArray(arr) && arr.length === 1)
    return flattenSingleArrayItem(arr[0]);
  else if (Array.isArray(arr)) return arr.map(flattenSingleArrayItem) as T[];
  else return arr;
};
