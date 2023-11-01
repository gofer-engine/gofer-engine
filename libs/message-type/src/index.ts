/* eslint-disable @typescript-eslint/no-explicit-any */
// FIXME: find a way to implement strict typing instead of allowing any
export type JSONValue =
  | undefined
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>;

export interface IMsg {
  kind: string;
  setMsg: (msg: any) => IMsg;
  json: (normalized?: boolean) => any;
  toString: () => string;
  set: (path?: string | undefined, value?: string | null | undefined) => IMsg;
  setJSON: (path: string | undefined, json: any) => IMsg;
  get: (path: string | undefined) => any;
  delete: (path: string) => IMsg;
  copy: (path: string, toPath: string) => IMsg;
  move: (fromPath: string, toPath: string) => IMsg;
  map: (
    path: string,
    v: string | Record<string, string> | string[] | (<T>(v: T, i: number) => T),
    options?: {
      iteration?: boolean | undefined;
    },
  ) => IMsg;
  setIteration: <Y>(
    path: string,
    map: Y[] | ((val: Y, i: number) => Y),
    options?: { allowLoop: boolean },
  ) => IMsg;
}

export const isMsg = (msg: unknown): msg is IMsg => {
  if (typeof msg !== 'object') return false;
  if (msg === null) return false;
  if (Array.isArray(msg)) return false;
  return (
    [
      'setMsg',
      'json',
      // 'addSegment',
      'toString',
      'set',
      'setJSON',
      'get',
      // 'getSegments',
      // 'getSegment',
      // 'id',
      // 'transform',
      'delete',
      'copy',
      'move',
      // 'map',
      // 'setIteration',
    ] as (keyof IMsg)[]
  ).every(
    (method) =>
      method in msg &&
      typeof (msg as unknown as Record<string, unknown>)[method] === 'function',
  );
};