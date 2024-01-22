import { Element, xml2js, js2xml, ElementCompact } from 'xml-js';
import { cloneDeep, get, set, unset } from 'lodash';
// import jsdom from 'jsdom';

import xpath, { SelectReturnType, SelectSingleReturnType } from 'xpath';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { Xslt, XmlParser } from 'xslt-processor'


import { IMsg, isMsg } from '@gofer-engine/message-type';

import { parseXMLPath } from './parseXMLPath';
import { getJson } from "./getJson";
import { domSetAttribute } from "xslt-processor/dom";

// export { parseXMLPath };

export interface IXMLMsg extends IMsg {
  kind: 'XML';
  setMsg: (xml: Document | string) => IXMLMsg;
  json: <N extends boolean>(
    _normalized?: N,
  ) => N extends true ? Element : ElementCompact;
  set: (path?: string | undefined, value?: Document | SelectReturnType | SelectSingleReturnType) => IXMLMsg;
  setJSON: (path, msg: Element) => IXMLMsg;
  get: (
    path: string | undefined,
    clone?: boolean,
    ns?: Record<string, string> | boolean,
  ) => Document | SelectReturnType | SelectSingleReturnType;
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

interface IXMLMsgCache {
  namespaces?: Record<string, string>;
  json?: Element;
  jsonCompact?: ElementCompact;
}

export class XMLMsg implements IXMLMsg {
  readonly kind = 'XML';
  private _strict: boolean | undefined;
  get strict() {
    return this._strict ?? false;
  }
  set strict(val: boolean) {
    if (this._strict || this._strict === undefined) {
      this._strict = val;
    } else if (val) {
      throw new Error(`Cannot set ${this.constructor.name} strict mode to true once set to false`);
    }
    // already false, and setting to false again, so noop.
  }
  private _doc: Document;
  private _serializer: XMLSerializer;
  private _parse = (msg: string) => new DOMParser().parseFromString(msg, 'text/xml');
  
  private _removeNamespaces = (clone = true) => {
    if (this.strict) {
      throw new Error(`Cannot use unsafe _removeNamespaces method on ${this.constructor.name} class in strict mode. First set strict parameter to false if you are sure you want to use this method.`);
    }
    const xml = this.toString().replace(/(?:\s)?xmlns(?::\w+)?="[^"]+"/g, '')
    if (!clone) {
      // FIXME: Log warning of unsafe operation with potential data loss
      // console.warn('WARNING: `clone` is set to false. This will remove any namespacing which risk name clashes and lose the ability to differentiate between once-distinct elements')
      this.setMsg(xml)
      return this._doc;
    }
    return this._parse(xml);
  };
  private _useCache = true;
  private _cache: IXMLMsgCache = {};
  private get cache() {
    if (!this._useCache) {
      return {};
    }
    return this._cache;
  }
  private _clearCache = () => {this._cache = {}};
  private _cloneResp = <R>(resp: R, clone: boolean): R => {
    if (clone) {
      return cloneDeep(resp);
    }
    if (this.strict) {
      throw new Error('Cannot return mutable reference in strict mode');
    }
    // NOTE: once we return an reference to the document, we can no longer
    // trust the cache, until the link of the reference is broken, e.g. by
    // calling setMsg.
    this._useCache = false;
    this._clearCache();
    return resp;
  }
  constructor(xml: string | Document, strict = false) {
    this.strict = strict;
    if (typeof xml === 'string') {
      this._doc = this._parse(xml);
    } else {
      this._doc = cloneDeep(xml);
    }
    this._serializer = new XMLSerializer();
  }
  // setMsg = (msg: XMLJson | string): IXMLMsg => {
  //   if (typeof msg === 'string') {
  //     this._msg = parseXMLString(msg);
  //   } else {
  //     this._msg = cloneDeep(msg);
  //   }
  //   return this;
  // };
  setMsg = (xml: Document | string): IXMLMsg => {
    this._clearCache();
    if (typeof xml === 'string') {
      this._doc = this._parse(xml);
    } else {
      this._doc = cloneDeep(xml);
    }
    // any previously held references to the document are now invalid,
    // so we can trust the cache again.
    this._useCache = true;
    return this;
  };
  // toString = () => js2xml(this._msg, { spaces: 2 });
  toString = () => this._serializer.serializeToString(this._doc);
  // parsePath = (path: string): (string | number)[] => parseXMLPath(path);
  // get = <R extends XMLJson>(path?: string): R => getXML(this.json(true), this.parsePath(path)) as R
  // getXML = (path: string) => js2xml(this.get(path) ?? {});
  document = (clone = true) => {
    if (clone) {
      return cloneDeep(this._doc);
    }
    if (this.strict) {
      throw new Error('Cannot return mutable reference in strict mode. Either set clone argument to true, or strict parameter to false.');
    }
    // we are returning a reference to the document, so we can no longer trust
    this._clearCache();
    this._useCache = false;
    return this._doc;
  }
  /**
   * Transform the message with the provided XSLT
   * @param xslt_string XSLT string
   * @param write If true, the transformation will be applied to the original
   * message. If false, the transformation will be only be returned and not
   * applied to the original.
   */
  applyXSLT = (xslt_string: string, write: false) => {
    const xslt = new Xslt();
    const xmlParser = new XmlParser();
    const outXML = xslt.xsltProcess(
      xmlParser.xmlParse(this.toString()),
      xmlParser.xmlParse(xslt_string)
    );
    if (write) {
      this.setMsg(outXML);
    }
    return outXML;
  }
  get = <R extends Document | SelectReturnType | SelectSingleReturnType>(path?: string, clone = true, ns?: Record<string, string> | boolean): R => {
    if (!path) {
      return this._cloneResp(this._doc as R, clone);
    }
    if (ns === true) {
      let namespaces: Record<string, string> = {}
      if (this.cache?.namespaces) {
        // NOTE: this is a little better at least with a cache so the expesive
        // operations are only done once, until the cache is invalidated.
        namespaces = this._cache.namespaces;
      } else {
        // TODO: find a better way to get all namespaces from the document that
        // doesn't require serializing and regex over the whole string.
        const xml = this.toString();
        const matches = xml.matchAll(/xmlns(?::(\w+))?="([^"]+)"/g)
        for (const [_, nsKey, nsUri] of matches) {
          if (nsKey) {
            namespaces[nsKey] = nsUri;
            continue;
          }
          const prefix = nsUri.split('/').pop();
          namespaces[prefix] = nsUri;
        }
        if (this._useCache) {
          this._cache.namespaces = namespaces;
        }
      }
      return this._cloneResp(xpath.useNamespaces(namespaces)(path, this._doc) as R, clone);
    }
    let doc = this._doc;
    if (ns === false) {
      doc = this._removeNamespaces(clone);
    }
    if (typeof ns === 'object' && Object.keys(ns).length) {
      return this._cloneResp(xpath.useNamespaces(ns)(path, doc) as R, clone);
    }
    return this._cloneResp(xpath.select(path, doc) as R, clone);
  }
  set = (
    path?: string,
    value?: Document | SelectReturnType | SelectSingleReturnType | SelectSingleReturnType[] | Record<string, string>,
    parse = false,
    ns?: Record<string, string> | boolean,
  ): IXMLMsg => {
    // WIP:
    const existing = this.get(path, false, ns);
    // console.log(existing)
    if (existing) {
      if (Array.isArray(existing)) {
        existing.forEach((e,i) => {
          if (e.constructor.name === 'Attr') {
            if (typeof value === 'string' || typeof value === 'number') {
              e.textContent = value.toString();
            } else if (Array.isArray(value)) {
              const v = value[i];
              if (typeof v === 'string') {
                e.textContent = v;
              }
            } else if (typeof value === 'object' && value !== null) {
              const v = value?.[e.nodeName];
              if (v) {
                delete value[e.nodeName];
              }
              if (typeof v === 'string' || typeof v === 'number') {
                e.textContent = v.toString();
              }
            }
          }
          console.log(
            e.toString(),
            typeof e,
            e.constructor.name,
            e.nodeValue,
          )
        })
        if (typeof value === 'object' && value !== null) {
          for (const [k, v] of Object.entries(value)) {
            const e = existing?.[0]
            console.log(e, e.constructor.name, e.toString())
            if (e.constructor.name === 'Attr') {
              const p = e.parentElement
              console.log(p, p.constructor.name, p.toString())
            }
            // const attr = this._doc.createAttribute(k);
            // attr.textContent = v;
            // existing[0].parentNode?.appendChild(attr);
          }
        }
      }
    }

    return this;
  };
  delete = (path: string): IXMLMsg => {
    // FIXME! Implement this with xPath and Document API
    return this;
  };
  copy = (path: string, toPath: string): IXMLMsg => {
    // FIXME! Implement this with xPath and Document API
    return this;
  };
  move = (fromPath: string, toPath: string): IXMLMsg => {
    // FIXME! Implement this with xPath and Document API
    return this;
  };

  private _jsonify = () => {
    if (this.cache.json) {
      return this.cache.json;
    }
    const json = xml2js(this.toString()) as Element;
    if (this._useCache) {
      this._cache.json = json;
    }
    return json;
  }
  private _compact = () => {
    if (this.cache.jsonCompact) {
      return this.cache.jsonCompact;
    }
    const json = xml2js(this.toString(), { compact: true }) as ElementCompact;
    if (this._useCache) {
      this._cache.jsonCompact = json;
    }
    return json;
  }
  json = <N extends boolean>(
    normalized?: N,
  ): N extends true ? Element : ElementCompact => {
    return (normalized ? this._jsonify() : this._compact()) as N extends true
      ? Element
      : ElementCompact;
  };
  private _uncompact = (msg: ElementCompact) => {
    if (this.strict) {
      throw new Error(`Cannot use unsafe _uncompact method on ${this.constructor.name} class in strict mode. First set strict parameter to false if you are sure you want to use this method.`);
    }
    this.setMsg(js2xml(msg, { compact: true }));
    this._cache.jsonCompact = msg;
  };
  private _process = (fn: (msg: ElementCompact) => ElementCompact) => {
    const msg = this._compact();
    if (typeof msg !== 'object') {
      throw new Error('Cannot set path on non-object');
    }
    this._uncompact(fn(msg));
  };
  // getJson uses non-compact json and support xPath-like paths.
  getJson = <R extends Element>(path?: string) => {
    return getJson(this.json(true), parseXMLPath(path)) as R;
  };
  setJSON = (path: string, msg: Element) => {
    // FIXME: Implement this with path and non-compact json
    // this.setMsg(js2xml(msg, { compact: false }))
    return this;
  };
  // getJs uses compact json, and does NOT support xPath-like paths.
  getJs = <R extends ElementCompact>(path?: string) => {
    return cloneDeep(get(this.json(false), path) as R);
  }
  setJs = (
    path?: string,
    value?: string | ElementCompact,
    parse = false,
  ): IXMLMsg => {
    if (this.strict) {
      throw new Error(`Cannot use unsafe setJs method on ${this.constructor.name} class in strict mode. First set strict parameter to false if you are sure you want to use this method.`);
    }
    value = cloneDeep(value);
    if (path === undefined) {
      throw new Error('Cannot set path on undefined');
    } else {
      if (parse) {
        value = xml2js(value as string, { compact: true });
      }
      this._process((msg) => set(msg, path, value));
    }
    return this;
  };
  deleteJs = (path: string): IXMLMsg => {
    if (this.strict) {
      throw new Error(`Cannot use unsafe deleteJs method on ${this.constructor.name} class in strict mode. First set strict parameter to false if you are sure you want to use this method.`);
    }
    this._process((msg) => {
      unset(msg, path);
      return msg;
    });
    return this;
  };
  copyJs = (path: string, toPath: string): IXMLMsg => {
    if (this.strict) {
      throw new Error(`Cannot use unsafe copyJs method on ${this.constructor.name} class in strict mode. First set strict parameter to false if you are sure you want to use this method.`);
    }
    this.setJs(toPath, this.getJs(path));
    return this;
  };
  moveJs = (fromPath: string, toPath: string): IXMLMsg => {
    if (this.strict) {
      throw new Error(`Cannot use unsafe moveJs method on ${this.constructor.name} class in strict mode. First set strict parameter to false if you are sure you want to use this method.`);
    }
    this._process((msg) => {
      msg = set(msg, toPath, this.getJs(fromPath));
      unset(msg, fromPath);
      return msg;
    });
    return this;
  };

  map = (
    path: string,
    v: string | Record<string, string> | string[] | (<T>(v: T, i: number) => T),
    { iteration }: { iteration?: boolean | undefined } = {},
  ): IXMLMsg => {
    // FIXME: Implement this with xPath and Document API
    // if (typeof this._msg !== 'object') {
    //   throw new Error('Cannot map path on non-object msg');
    // }
    // const value = this.get(path);
    // if (Array.isArray(value)) {
    //   if (typeof v === 'string') {
    //     set(
    //       this._msg,
    //       path,
    //       value.map(() => v),
    //     );
    //   } else if (Array.isArray(v)) {
    //     set(
    //       this._msg,
    //       path,
    //       value.map((_, i) => (iteration ? v?.[i % v.length] : v?.[i])),
    //     );
    //   } else if (typeof v === 'object') {
    //     const val = value.map((val) => v?.[val as string]);
    //     set(this._msg, path, val);
    //   } else if (typeof v === 'function') {
    //     const val = value.map(v);
    //     set(this._msg, path, val);
    //   } else {
    //     throw new Error(
    //       'Cannot map non-string, non-array, non-object, non-function',
    //     );
    //   }
    // } else {
    //   throw new Error('Cannot map non-array');
    // }
    return this;
  };
  setIteration = <Y>(
    path: string,
    map: Y[] | ((val: Y, i: number) => Y),
    { allowLoop }: { allowLoop: boolean } = { allowLoop: true },
  ): IXMLMsg => {
    // FIXME: Implement this with xPath and Document API
    // if (typeof this._msg !== 'object') {
    //   throw new Error('Cannot map path on non-object msg');
    // }
    // const value = this.get(path);
    // if (!Array.isArray(value)) {
    //   throw new Error('Cannot map non-array');
    // }
    // if (Array.isArray(map)) {
    //   set(
    //     this._msg,
    //     path,
    //     value.map((_, i) => (allowLoop ? map?.[i % map.length] : map?.[i])),
    //   );
    // } else if (typeof map === 'function') {
    //   const val = value.map(map as any);
    //   set(this._msg, path, val);
    // } else {
    //   throw new Error('Cannot map non-array, non-function');
    // }
    return this;
  };
}

export default XMLMsg;
