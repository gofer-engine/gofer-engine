import { Element, xml2js, js2xml, ElementCompact } from 'xml-js';
import { cloneDeep, set, unset } from 'lodash';
// import jsdom from 'jsdom';

import xpath, { SelectReturnType, SelectSingleReturnType } from 'xpath';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { Xslt, XmlParser } from 'xslt-processor'


import { IMsg, isMsg } from '@gofer-engine/message-type';

// import { parseXMLPath } from './parseXMLPath';
// import { getXML } from "./getXML";
// import { parseXMLString } from "./parseXMLString";

// export { parseXMLPath };

export type XMLJson = Element;
export type XMLJsonCompact = ElementCompact;

export interface IXMLMsg extends IMsg {
  kind: 'XML';
  setMsg: (xml: Document | string) => IXMLMsg;
  json: <N extends boolean>(
    _normalized?: N,
  ) => N extends true ? XMLJson : XMLJsonCompact;
  set: (path?: string | undefined, value?: XMLJsonCompact) => IXMLMsg;
  get: (path: string | undefined) => Document | SelectReturnType | SelectSingleReturnType;
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
  private _msg: XMLJson = {};
  private _doc: Document;
  private _serializer: XMLSerializer;
  private _jsonify = () => xml2js(this.toString())
  private _compact = () =>
    xml2js(this.toString(), { compact: true }) as XMLJsonCompact;
  private _uncompact = (msg: XMLJsonCompact) => {
    this.setMsg(js2xml(msg, { compact: true }));
  };
  private _process = (fn: (msg: XMLJsonCompact) => XMLJsonCompact) => {
    this._uncompact(fn(this._compact()));
  };
  private _removeNamespaces = () => {
    this.setMsg(this.toString().replace(/(?:\s)?xmlns(?::\w+)?="[^"]+"/g, ''))
  };
  // constructor(msg?: string | XMLJson) {
  //   if (typeof msg === 'string') {
  //     this._msg = parseXMLString(msg);
  //   } else if (msg !== undefined) {
  //     // NOTE: clone the msg so that we don't mutate the original nor external
  //     // mutations affect us.
  //     this._msg = cloneDeep(msg);
  //   }
  // };
  constructor(xml: string) {
    this._doc = new DOMParser().parseFromString(xml, 'text/xml');
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
    if (typeof xml === 'string') {
      this._doc = new DOMParser().parseFromString(xml, 'text/xml');
    } else {
      // FIXME: how do we deeply clone a Document?
      this._doc = xml;
    }
    return this;
  };
  json = <N extends boolean>(
    normalized?: N,
  ): N extends true ? XMLJson : XMLJsonCompact => {
    return (normalized ? this._jsonify() : this._compact()) as N extends true
      ? XMLJson
      : XMLJsonCompact;
  };
  // toString = () => js2xml(this._msg, { spaces: 2 });
  toString = () => this._serializer.serializeToString(this._doc);
  set = (
    path?: string,
    value?: string | XMLJsonCompact,
    parse = false,
  ): IXMLMsg => {
    value = cloneDeep(value);
    if (path === undefined) {
      throw new Error('Cannot set path on undefined');
    } else if (typeof this._msg === 'object') {
      if (parse) {
        value = xml2js(value as string, { compact: true });
      }
      this._process((msg) => set(msg, path, value));
    } else {
      throw new Error('Cannot set path on non-object');
    }
    return this;
  };
  setJSON = this.set;
  // parsePath = (path: string): (string | number)[] => parseXMLPath(path);
  // get = <R extends XMLJson>(path?: string): R => getXML(this.json(true), this.parsePath(path)) as R
  // getXML = (path: string) => js2xml(this.get(path) ?? {});
  get = <R extends Document | SelectReturnType | SelectSingleReturnType>(path?: string, ns?: Record<string, string> | boolean): R => {
    if (!path) {
      return this._doc as R;
    }
    if (ns === true) {
      // TODO: find a better way to get all namespaces from the document that
      // doesn't require serializing and regex over the whole string.
      const namespaces: Record<string, string> = {}
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
      return xpath.useNamespaces(namespaces)(path, this._doc) as R
    }
    if (ns === false) {
      this._removeNamespaces();
      // FIXME: Log warning of unsafe operation with potential data loss
      // console.warn('WARNING: `ns` is set to false. This will remove any namespacing which risk name clashes and lose the ability to differentiate between once-distinct elements')
    }
    if (typeof ns === 'object' && Object.keys(ns).length) {
      return xpath.useNamespaces(ns)(path, this._doc) as R
    }
    return xpath.select(path, this._doc) as R;
  }
  document = () => this._doc;
  /**
   * Transform the message with the provided XSLT.
   */
  applyXSLT = (xslt_string: string) => {
    const xslt = new Xslt();
    const xmlParser = new XmlParser();
    const outXML = xslt.xsltProcess(
      xmlParser.xmlParse(this.toString()),
      xmlParser.xmlParse(xslt_string)
    );
    return outXML;
    // this.setMsg(outXML);

    // new Xslt().xsltProcess(
    //   // xmlParse(this.toString()),
    //   xmlParse(`<?xml version="1.0"?>
    //     <root>
    //       <foo xmlns="http://www.w3.org/1999/xhtml">
    //         <bar value="Bar"/>
    //         <baz>Baz</baz>
    //       </foo>
    //     </root>
    //   `),
    //   xmlParse(xslt)
    // );

    // return this;
  }
  // document = (cb: (doc: Document, writeBack: ()=> void) => void) => {
  //   const DOM = new jsdom.JSDOM(this.toString(), { contentType: 'application/xhtml+xml' });
  //   cb(DOM.window.document, () => {
  //     this.setMsg(DOM.serialize());
  //   });
  //   /* FIXME: There is a curent limitation with jsdom serialization that
  //    * excludes the xml declaration line. Example: `<?xml version="1.0"
  //    * encoding="UTF-8"?>`. By using the document  Open Issue: https://github.com/jsdom/jsdom/issues/2615
  //    */
  //   return this;
  // }
  // get = <R>(path?: string): R => {
  //   // TODO: decide if we want to return undefined instead of the entire
  //   // message when no path is provided. How do we handle this with HL7v2?
  //   // FIXME: Is there a better way than to cast to R?
  //   if (path === undefined) return this.json() as R;
  //   const valueObject = get(this.json(), path);
  //   if (
  //     typeof valueObject === 'object' &&
  //     '_attributes' in valueObject &&
  //     Object.keys(valueObject).length === 1
  //   ) {
  //     const attributes = valueObject._attributes;
  //     if (typeof attributes === 'object' && 'value' in attributes) {
  //       return attributes.value as R;
  //     }
  //   }
  //   return js2xml(valueObject, { compact: true, spaces: 2 }) as R;
  // };
  delete = (path: string): IXMLMsg => {
    this._process((msg) => {
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
