export const encodeSep = (
  msg: unknown,
  sep: string,
  map: (msg: unknown) => unknown = (m) => m
) => {
  if (!Array.isArray(msg)) return msg;
  return msg.map(map).join(sep);
};
