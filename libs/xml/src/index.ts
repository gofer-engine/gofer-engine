import { Element, xml2js, js2xml, ElementCompact } from 'xml-js';
import { cloneDeep, get, set, unset } from 'lodash';

import { IMsg, isMsg } from '@gofer-engine/message-type';

export interface IXMLMsg extends IMsg {
  kind: 'XML';
  setMsg: (msg: Element) => IXMLMsg;
  json: <N extends boolean>(
    _normalized?: N,
  ) => N extends true ? Element : ElementCompact;
  set: (path?: string | undefined, value?: ElementCompact) => IXMLMsg;
  get: (path: string | undefined) => string | ElementCompact;
  delete: (path: string) => IXMLMsg;
  copy: (path: string, toPath: string) => IXMLMsg;
  move: (fromPath: string, toPath: string) => IXMLMsg;
  map: (
    path: string,
    v: string | Record<string, string> | string[] | (<T>(v: T, i: number) => T),
    options?: {
      iteration?: boolean | undefined;
    },
  ) => IXMLMsg;
  setIteration: <Y>(
    path: string,
    map: Y[] | ((val: Y, i: number) => Y),
    options?: { allowLoop: boolean },
  ) => IXMLMsg;
}

export const isXMLMsg = (msg: unknown): msg is IXMLMsg => {
  return isMsg(msg) && msg.kind === 'XML';
};

export class XMLMsg implements IXMLMsg {
  readonly kind = 'XML';
  private _msg: Element = {};
  private compact = () =>
    xml2js(js2xml(this._msg), { compact: true }) as ElementCompact;
  private uncompact = (msg: ElementCompact) => {
    this._msg = xml2js(js2xml(msg, { compact: true })) as Element;
  };
  private process = (fn: (msg: ElementCompact) => ElementCompact) => {
    this.uncompact(fn(this.compact()));
  };
  constructor(msg?: string | Element, parse = true) {
    if (parse) {
      if (typeof msg === 'string') {
        try {
          this._msg = xml2js(msg, { compact: false }) as Element;
        } catch (err) {
          throw new Error(`Cannot parse string with xml2js: ${err}`);
        }
      } else {
        throw new Error(`Cannot parse ${typeof msg} with xml2js`);
      }
    } else {
      if (typeof msg === 'string') {
        throw new Error(`Cannot create XMLMsg from string without parse`);
      }
      if (msg !== undefined) {
        this._msg = cloneDeep(msg);
      }
    }
  }
  setMsg = (msg: Element): IXMLMsg => {
    this._msg = cloneDeep(msg);
    return this;
  };
  json = <N extends boolean>(
    normalized?: N,
  ): N extends true ? Element : ElementCompact => {
    const msg = cloneDeep(this._msg);
    return (normalized ? msg : this.compact()) as N extends true
      ? Element
      : ElementCompact;
  };
  toString = () => js2xml(this._msg, { spaces: 2 });
  set = (
    path?: string,
    value?: string | ElementCompact,
    parse = false,
  ): IXMLMsg => {
    value = cloneDeep(value);
    if (path === undefined) {
      throw new Error('Cannot set path on undefined');
    } else if (typeof this._msg === 'object') {
      if (parse) {
        value = xml2js(value as string, { compact: true });
      }
      this.process((msg) => set(msg, path, value));
    } else {
      throw new Error('Cannot set path on non-object');
    }
    return this;
  };
  setJSON = this.set;
  get = <R>(path?: string): R => {
    // TODO: decide if we want to return undefined instead of the entire
    // message when no path is provided. How do we handle this with HL7v2?
    // FIXME: Is there a better way than to cast to R?
    if (path === undefined) return this.json() as R;
    const valueObject = get(this.json(), path);
    if (
      typeof valueObject === 'object' &&
      '_attributes' in valueObject &&
      Object.keys(valueObject).length === 1
    ) {
      const attributes = valueObject._attributes;
      if (typeof attributes === 'object' && 'value' in attributes) {
        return attributes.value as R;
      }
    }
    return js2xml(valueObject, { compact: true, spaces: 2 }) as R;
  };
  delete = (path: string): IXMLMsg => {
    this.process((msg) => {
      unset(msg, path);
      return msg;
    });
    return this;
  };
  copy = (path: string, toPath: string): IXMLMsg => {
    // TODO: add type checking that the destination path type can accept the source path type.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = this.get<any>(path);
    this.set(toPath, value);
    return this;
  };
  move = (fromPath: string, toPath: string): IXMLMsg => {
    // TODO: add type checking that the destination path type can accept the source path type.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = this.get<any>(fromPath);
    this.set(toPath, value);
    this.delete(fromPath);
    return this;
  };
  map = (
    path: string,
    v: string | Record<string, string> | string[] | (<T>(v: T, i: number) => T),
    { iteration }: { iteration?: boolean | undefined } = {},
  ): IXMLMsg => {
    if (typeof this._msg !== 'object') {
      throw new Error('Cannot map path on non-object msg');
    }
    const value = this.get(path);
    if (Array.isArray(value)) {
      if (typeof v === 'string') {
        set(
          this._msg,
          path,
          value.map(() => v),
        );
      } else if (Array.isArray(v)) {
        set(
          this._msg,
          path,
          value.map((_, i) => (iteration ? v?.[i % v.length] : v?.[i])),
        );
      } else if (typeof v === 'object') {
        const val = value.map((val) => v?.[val as string]);
        set(this._msg, path, val);
      } else if (typeof v === 'function') {
        const val = value.map(v);
        set(this._msg, path, val);
      } else {
        throw new Error(
          'Cannot map non-string, non-array, non-object, non-function',
        );
      }
    } else {
      throw new Error('Cannot map non-array');
    }
    return this;
  };
  setIteration = <Y>(
    path: string,
    map: Y[] | ((val: Y, i: number) => Y),
    { allowLoop }: { allowLoop: boolean } = { allowLoop: true },
  ): IXMLMsg => {
    if (typeof this._msg !== 'object') {
      throw new Error('Cannot map path on non-object msg');
    }
    const value = this.get(path);
    if (!Array.isArray(value)) {
      throw new Error('Cannot map non-array');
    }
    if (Array.isArray(map)) {
      set(
        this._msg,
        path,
        value.map((_, i) => (allowLoop ? map?.[i % map.length] : map?.[i])),
      );
    } else if (typeof map === 'function') {
      const val = value.map(map as any);
      set(this._msg, path, val);
    } else {
      throw new Error('Cannot map non-array, non-function');
    }
    return this;
  };
}

export default XMLMsg;
