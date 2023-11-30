import { IDelimitedOptions, IMessageContext, IMsg, isMsg } from '@gofer-engine/message-type';
import { cloneDeep } from 'lodash';
import Papa from 'papaparse';
import { getData } from './getData';
import { DelimitedValue, setData } from './setData';
import { deleteData } from './deleteData';
import { insertColumns } from './insertColumns';
import { parsePath } from './parsePath';

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
    value?: DelimitedValue
  ) => IDelimitedMsg;
  insertRows: (index: number, rows: string[][]) => IDelimitedMsg;
  insertColumns: (index: number, rows: string[][]) => IDelimitedMsg;
  setJSON: (
    path: string | undefined,
    json: DelimitedValue,
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
    v: string | Record<string, string> | string[] | (<T>(v: T, x: number, y: number) => T),
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

export const isDelimitedMsg = (msg: unknown, context?: IMessageContext): msg is IDelimitedMsg => {
  // if context is provided, it must be for a delimited message
  if (context !== undefined && context.kind !== 'DELIMITED') {
    return false;
  }
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
    options: IDelimitedOptions = {},
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
    path: string | undefined,
    value: DelimitedValue
  ) => this.set(path, value);
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
    path?: string,
    value?: DelimitedValue,
  ): IDelimitedMsg => {
    this._msg = cloneDeep(setData(this._msg, value, path))
    return this;
  };
  insertRows = (index: number, rows: string[][]): IDelimitedMsg => {
    this._msg.splice(index, 0, ...rows);
    return this;
  }
  insertColumns = (index: number, columns: string[][]): IDelimitedMsg => {
    this._msg = insertColumns(this._msg, index, columns);
    return this;
  }
  get = (path?: string) => getData(this._msg, path);
  delete = (path: string): IDelimitedMsg => {
    this._msg = deleteData(this._msg, path)
    return this;
  };
  copy = (path: string, toPath: string): IDelimitedMsg => {
    return this.set(toPath, this.get(path));
  };
  move = (fromPath: string, toPath: string): IDelimitedMsg => {
    return this.copy(fromPath, toPath).delete(fromPath);
  };
  map = (
    path: string,
    value: string | Record<string, string> | string[] | (<T>(v: T, x: number, y: number) => T),
  ): IDelimitedMsg => {
    if (typeof value !== 'function') {
      throw new Error('Map value for a delimited message must be a function');
    }
    let temp = this.get(path);
    if (typeof temp === 'string') {
      temp = [[temp]]
    }
    if (Array.isArray(temp) && temp.length > 0 && typeof temp[0] === 'string') {
      temp = [temp as string[]]
    }
    temp = temp as string[][]
    const { matrix } = parsePath(path, this._msg[0])
    if (typeof value === 'function') {
      temp = temp.map((row, x) => {
        return row.map((cell, y) => {
          if (matrix === 'column') {
            return value(cell, y, x);
          }
          return value(cell, x, y);
        })
      })
      this.set(path, temp);
    }
    return this;
  };
  /**
   * @deprecated Use map instead
   */
  setIteration = (
    path: string,
    // _map: Y[] | ((val: Y, i: number) => Y),
    // _options?: { allowLoop: boolean },
  ): IDelimitedMsg => {
    if (path !== undefined) {
      throw new Error('setIteration is not implemented for delimited messages. Use map instead.');
    }
    return this;
  };
}
