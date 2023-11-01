import { IMsg, JSONValue, isMsg } from "@gofer-engine/message-type";
import { cloneDeep, get, set, unset } from "lodash";

export interface IJSONMsg extends IMsg {
  kind: 'JSON';
  setMsg: (msg: JSONValue) => IJSONMsg;
  json: (_normalized?: boolean) => JSONValue;
  set: (path?: string | undefined, value?: JSONValue) => IJSONMsg;
  get: (path: string | undefined) => JSONValue;
  delete: (path: string) => IJSONMsg;
  copy: (path: string, toPath: string) => IJSONMsg;
  move: (fromPath: string, toPath: string) => IJSONMsg;
  map: (
    path: string,
    v: string | Record<string, string> | string[] | (<T>(v: T, i: number) => T),
    options?: {
      iteration?: boolean | undefined;
    },
  ) => IJSONMsg;
  setIteration: <Y>(
    path: string,
    map: Y[] | ((val: Y, i: number) => Y),
    options?: { allowLoop: boolean },
  ) => IJSONMsg;
}

export const isJSONMsg = (msg: unknown): msg is IJSONMsg => {
  return isMsg(msg) && msg.kind === 'JSON';
}

function sortKeys(obj: JSONValue): JSONValue {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortKeys);
  }

  return Object.keys(obj)
    .sort()
    .reduce((result: { [key: string]: JSONValue }, key: string) => {
      result[key] = sortKeys(obj[key]);
      return result;
    }, {});
}

/** TODO: use the avj library to validate JSON objects against a JSON schema.
 *  Here is a TypeScript function that does this:
 * 
 * ```typescript
 * import Ajv from 'ajv';
 * 
 * function validateJson(json: any, schema: any): boolean {
 *   const ajv = new Ajv();
 *   const validate = ajv.compile(schema);
 *   const valid = validate(json);
 *   if (!valid) {
 *     console.log(validate.errors);
 *   }
 *   return !!valid;
 * }
 * ```
 * 
 * This function takes a JSON object and a JSON schema as input. It uses the
 * ajv.compile method to compile the schema into a validation function, then
 * uses this function to validate the JSON object. If the JSON object is not
 * valid according to the schema, it logs the validation errors and returns
 * false. If the JSON object is valid, it returns true.
 * 
 * You can use this function in your code like this:
 * 
 * ```typescript
 * const isValid = validateJson(yourJsonObject, yourJsonSchema);
 * if (!isValid) {
 *   console.log('JSON object is not valid');
 * }
 * ```
 * 
 */

export class JSONMsg implements IJSONMsg {
  readonly kind = 'JSON';
  private _msg: JSONValue = undefined;
  setMsg = (msg: JSONValue): IJSONMsg => {
    this._msg = cloneDeep(msg);
    return this;
  };
  json = (normalized?: boolean): JSONValue => {
    const msg = cloneDeep(this._msg);
    return normalized ? sortKeys(msg) : msg; 
  };
  toString = () => JSON.stringify(this._msg);
  set = (
    path?: string,
    value?: JSONValue,
  ): IJSONMsg => {
    value = cloneDeep(value);
    if (path === undefined) {
      this._msg = value;
    } else if (typeof this._msg === 'object') {
      set(this._msg, path, value);
    } else {
      throw new Error('Cannot set path on non-object');
    }
    return this;
  };
  setJSON = this.set;
  get = (path?: string): JSONValue => {
    return get(this._msg, path);
  };
  delete = (path: string): IJSONMsg => {
    unset(this._msg, path);
    return this;
  };
  copy = (path: string, toPath: string): IJSONMsg => {
    const value = this.get(path);
    this.set(toPath, value);
    return this;
  };
  move = (fromPath: string, toPath: string): IJSONMsg => {
    const value = this.get(fromPath);
    this.set(toPath, value);
    this.delete(fromPath);
    return this;
  };
  map = (
    path: string,
    v: string | Record<string, string> | string[] | (<T>(v: T, i: number) => T),
    { iteration }: { iteration?: boolean | undefined } = {}
  ): IJSONMsg => {
    if (typeof this._msg !== 'object') {
      throw new Error('Cannot map path on non-object msg');
    }
    const value = this.get(path);
    if (Array.isArray(value)) {
      if (typeof v === 'string') {
        set(this._msg, path, value.map(() => v));
      } else if (Array.isArray(v)) {
        set(this._msg, path, value.map((_, i) => iteration ? v?.[i % v.length] : v?.[i]));
      } else if (typeof v === 'object') {
        const val = value.map((val) => v?.[val as string])
        set(this._msg, path, val);
      } else if (typeof v === 'function') {
        const val = value.map(v);
        set(this._msg, path, val);
      } else {
        throw new Error('Cannot map non-string, non-array, non-object, non-function');
      }
    } else {
      throw new Error('Cannot map non-array');
    }
    return this;
  }
  setIteration = <Y>(
    path: string,
    map: Y[] | ((val: Y, i: number) => Y),
    { allowLoop }: { allowLoop: boolean } = { allowLoop: true }
  ): IJSONMsg => {
      if (typeof this._msg !== 'object') {
        throw new Error('Cannot map path on non-object msg');
      }
      const value = this.get(path);
      if (!Array.isArray(value)) {
        throw new Error('Cannot map non-array');
      }
      if (Array.isArray(map)) {
        set(this._msg, path, value.map((_, i) => allowLoop ? map?.[i % map.length] : map?.[i]));
      } else if (typeof map === 'function') {
        const val = value.map(map as any);
        set(this._msg, path, val);
      } else {
        throw new Error('Cannot map non-array, non-function');
      }
      return this;
    };
}