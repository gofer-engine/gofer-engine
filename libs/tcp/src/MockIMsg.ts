import { IMsg } from "@gofer-engine/message-type";

export const MockIMsg: IMsg = {
  copy: () => MockIMsg,
  get: () => undefined,
  delete: () => MockIMsg,
  json: () => undefined,
  kind: 'HL7v2', // FIXME: should this be 'MOCK'?
  set: () => MockIMsg,
  toString: () => '',
  map: () => MockIMsg,
  move: () => MockIMsg,
  setIteration: () => MockIMsg,
  setJSON: () => MockIMsg,
  setMsg: () => MockIMsg,
};
