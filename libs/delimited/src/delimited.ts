import { IMsg, isMsg } from '@gofer-engine/message-type';
import { cloneDeep } from 'lodash';
import Papa from 'papaparse';
import { getData } from './getData';

export interface IDelimitedMsg extends IMsg {
  kind: 'DELIMITED';
  setMsg: (msg: string[][]) => IDelimitedMsg;
  toString: (options?: {
    quotes: boolean | boolean[];
    escapeFormulae: boolean;
  }) => string;
  json: <N extends boolean>(
    _normalized?: N,
  ) => N extends true ? string[][] : Record<string, string>[];
  set: (
    path?: string | undefined,
    value?:
      | Record<string, string>[]
      | Record<string, string>
      | string
      | string[]
      | string[][],
  ) => IDelimitedMsg;
  setJSON: (
    path: string | undefined,
    json:
      | Record<string, string>[]
      | Record<string, string>
      | string
      | string[]
      | string[][],
  ) => IDelimitedMsg;
  get: (
    path?: string | undefined,
  ) =>
    | string
    | Record<string, string>[]
    | Record<string, string>
    | string[]
    | string[][]
    | undefined;
  delete: (path: string) => IDelimitedMsg;
  copy: (path: string, toPath: string) => IDelimitedMsg;
  move: (fromPath: string, toPath: string) => IDelimitedMsg;
  map: (
    path: string,
    v:
      | string
      | string[]
      | string[][]
      | Record<string, string>
      | Record<string, string>[]
      | (<T>(v: T, i: number) => T),
    options?: {
      iteration?: boolean | undefined;
    },
  ) => IDelimitedMsg;
  setIteration: <Y>(
    path: string,
    map: Y[] | ((val: Y, i: number) => Y),
    options?: { allowLoop: boolean },
  ) => IDelimitedMsg;
}

export const isDelimitedMsg = (msg: unknown): msg is IDelimitedMsg => {
  return isMsg(msg) && msg.kind === 'DELIMITED';
};

export class DelimitedMsg implements IDelimitedMsg {
  readonly kind = 'DELIMITED';
  public delimiter: string;
  public escapeChar: string;
  public quoteChar: string;
  public rowDelimiter: '\r' | '\n' | '\r\n';
  private _msg: string[][];
  private parse = (str: string, config?: Papa.ParseConfig<string[]>) => {
    return Papa.parse(str, config);
  };
  constructor(
    msg?: string | string[][],
    options: {
      delimiter?: string;
      escapeChar?: string;
      quoteChar?: string;
      rowDelimiter?: '\r' | '\n' | '\r\n';
    } = {},
  ) {
    if (typeof msg === 'string') {
      const parsed = this.parse(msg, {
        delimiter: options.delimiter,
        escapeChar: options.escapeChar,
        quoteChar: options.quoteChar,
        newline: options.rowDelimiter,
        header: false,
      });
      if (parsed.errors.length) {
        throw new Error(`Cannot parse string with papaparse: ${parsed.errors}`);
      }
      this._msg = parsed.data;
      this.delimiter = parsed.meta.delimiter;
      this.escapeChar = options.escapeChar || '\\';
      this.quoteChar = options.quoteChar || '"';
      if (
        parsed.meta.linebreak === '\r\n' ||
        parsed.meta.linebreak === '\n' ||
        parsed.meta.linebreak === '\r'
      ) {
        this.rowDelimiter = parsed.meta.linebreak;
      } else {
        this.rowDelimiter = '\n';
      }
    } else {
      this._msg = msg;
      this.delimiter = options.delimiter || ',';
      this.escapeChar = options.escapeChar || '\\';
      this.quoteChar = options.quoteChar || '"';
      this.rowDelimiter = options.rowDelimiter || '\n';
    }
  }
  setMsg = (msg: string[][]): IDelimitedMsg => {
    this._msg = msg;
    return this;
  };
  setJSON = (
    _path: string | undefined,
    _json:
      | Record<string, string>[]
      | Record<string, string>
      | string
      | string[]
      | string[][],
  ): IDelimitedMsg => {
    // TODO: implement setJSON method
    return this;
  };
  toString = ({
    quotes = true,
    escapeFormulae = true,
  }: {
    quotes?: boolean | boolean[];
    escapeFormulae?: boolean;
  } = {}) => {
    return Papa.unparse(this._msg, {
      delimiter: this.delimiter,
      escapeChar: this.escapeChar,
      quoteChar: this.quoteChar,
      newline: this.rowDelimiter,
      quotes,
      escapeFormulae,
    });
  };
  json = <N extends boolean>(
    normalized?: N,
  ): N extends true ? string[][] : Record<string, string>[] => {
    const msg = cloneDeep(this._msg);
    return (
      normalized
        ? msg
        : this.parse(this.toString(), {
            delimiter: this.delimiter,
            escapeChar: this.escapeChar,
            quoteChar: this.quoteChar,
            newline: this.rowDelimiter,
            header: true,
          })
    ) as N extends true ? string[][] : Record<string, string>[];
  };
  set = (
    _path?: string,
    _value?:
      | Record<string, string>[]
      | Record<string, string>
      | string
      | string[]
      | string[][],
  ): IDelimitedMsg => {
    // TODO: implement set method
    return this;
  };
  get = (path?: string) => getData(this._msg, path);
  delete = (_path: string): IDelimitedMsg => {
    // TODO: implement delete method
    return this;
  };
  copy = (path: string, toPath: string): IDelimitedMsg => {
    return this.set(toPath, this.get(path));
  };
  move = (fromPath: string, toPath: string): IDelimitedMsg => {
    return this.copy(fromPath, toPath).delete(fromPath);
  };
  map = (
    _path: string,
    _value:
      | string
      | string[]
      | string[][]
      | Record<string, string>
      | Record<string, string>[]
      | (<T>(v: T, i: number) => T),
    _options?: {
      iteration?: boolean | undefined;
    },
  ): IDelimitedMsg => {
    // TODO: implement map method
    return this;
  };
  setIteration = <Y>(
    
    _path: string,
    _map: Y[] | ((val: Y, i: number) => Y),
    _options?: { allowLoop: boolean },
  ): IDelimitedMsg => {
    // TODO: implement setIteration method
    return this;
  };
}
