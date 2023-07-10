import { deepCopy } from './deepCopy';

export const encodeRep = (
  _msg: unknown,
  rep: string,
  map: (msg: unknown) => unknown
) => {
  const msg = deepCopy(_msg);
  if (!Array.isArray(msg) || msg === undefined || msg === null) {
    return map(msg);
  }
  if (
    typeof msg?.[0] === 'object' &&
    msg?.[0] !== null &&
    Object.prototype.hasOwnProperty.call(msg?.[0], 'rep')
  ) {
    msg.shift();
    return msg.map(map).join(rep);
  }
  return map(msg);
};
