export const deepCopy = <T>(data: T): T => {
  if (typeof data !== 'object' || data === null) return data;
  if (Array.isArray(data)) {
    return Array.from({ length: data.length }, (_, i) =>
      deepCopy(data[i]),
    ) as T;
  }
  if (data instanceof Date) return new Date(data) as T;
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, deepCopy(v)]),
  ) as T;
};
