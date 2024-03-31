```ts title="/src/IMsg.ts"
interface IMsg {
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
  // this method is hidden from the homepage docs
  map: (
    path: string,
    v: string | Record<string, string> | string[] | (<T>(v: T, i: number) => T),
    options?: {
      iteration?: boolean | undefined;
    },
  ) => IMsg;
  // this method is hidden from the homepage docs
  setIteration: <Y>(
    path: string,
    map: Y[] | ((val: Y, i: number) => Y),
    options?: { allowLoop: boolean },
  ) => IMsg;
}
```
