import { deepCopy } from './deepCopy'

export const encodeRep = (
  _msg: unknown,
  rep: string,
  map: (msg: unknown) => unknown = (m) => m
) => {
  const msg = deepCopy(_msg)
  if (!Array.isArray(msg) || msg === undefined || msg === null) {
    return map(msg)
  }
  if (typeof msg?.[0] === 'object' && msg?.[0]?.hasOwnProperty('rep')) {
    msg.shift()
    return msg.map(map).join(rep)
  }
  return map(msg)
}
