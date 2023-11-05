// FIXME: find a way to implement strict typing instead of allowing any
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IMsg {
  kind: string;
  setMsg: (msg: any) => IMsg;
  json: (normalized?: boolean) => any;
  toString: () => string;
  set: (path?: string | undefined, value?: any) => IMsg;
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
/* eslint-enable @typescript-eslint/no-explicit-any */
