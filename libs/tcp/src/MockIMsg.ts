import { IMsg } from "@gofer-engine/message-type";

export const MockIMsg: IMsg = {
  copy: () => MockIMsg,
  get: () => undefined,
  delete: () => MockIMsg,
  json: () => '"MockIMsg"',
  kind: 'MOCK',
  set: () => MockIMsg,
  toString: () => 'MockIMsg',
  map: () => MockIMsg,
  move: () => MockIMsg,
  setIteration: () => MockIMsg,
  setJSON: () => MockIMsg,
  setMsg: () => MockIMsg,
};
