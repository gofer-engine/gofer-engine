import { IMsg, isMsg } from '@gofer-engine/message-type';
import { cloneDeep } from "lodash";
import Papa from 'papaparse';

export interface IDelimitedMsg extends IMsg {
  kind: 'DELIMITED';
  setMsg: (msg: string[][]) => IDelimitedMsg;
  toString: (options?: {
    quotes: boolean | boolean[];
    escapeFormulae: boolean;
  }) => string;
  json: <N extends boolean>(_normalized?: N) => N extends true ? string[][] : Record<string, string>[];
  set: (path?: string | undefined, value?: Record<string, string>[] | Record<string, string> | string | string[] | string[][]) => IDelimitedMsg;
  setJSON: (path: string | undefined, json: Record<string, string>[] | Record<string, string> | string | string[] | string[][]) => IDelimitedMsg;
  get: (path?: string | undefined) => string | Record<string, string>[] | Record<string, string> | string[] | string[][] | undefined;
  delete: (path: string) => IDelimitedMsg;
  copy: (path: string, toPath: string) => IDelimitedMsg;
  move: (fromPath: string, toPath: string) => IDelimitedMsg;
  map: (
    path: string,
    v: string | string[] | string[][] | Record<string, string> | Record<string, string>[] | (<T>(v: T, i: number) => T),
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
  public rowDelimiter: '\r' | '\n'| '\r\n';
  private _msg: string[][];
  private parse = (str: string, config?: Papa.ParseConfig<string[]>) => {
    return Papa.parse(str, config)
  }
  private parsePath = (path: string) => {
    /**
     * What do we want to support here?
     * 
     * Q: should we assume and skip header rows? Or leave that to the user with a flag or docs incicating that row 1 is the header row if it exists?
     * A: TBD
     * 
     * Q: What should be returned if the row or column does not exist?
     * A: TBD, but probably `undefined`
     * 
     * Path can be to a single cell, such as 'A1' to reference column A (first column), row 1
     *   - if the path is to a single cell, then the value is a `string`
     *   - Permeations include:
     *    - 'A[1]'
     *    - 'A.1'
     *    - '[1].A'
     *    - Note 'A' is the column index alphabetically, but could also be the column name.
     *   - If the column name contains a number or spaces, then the column name must be (single or double) quoted like:
     *    - '"Column 1"[1]' or "'Column 1'[1]"
     *    - '"Column 1".1' or "'Column 1'.1"
     *    - '[1]."Column 1"' or "[1].'Column 1'"
     *   - Note that `A-1` is not valid because the `-` is a reserved character for ranges
     * 
     *   - Examples:
     *     A[1]
     *     aa[10]
     *     a.1
     *     Z.15
     *     [1].AZ
     *     "Column 1"[1]
     *     'Column 1'[1]
     *     "Column 1".1
     *     'Column 1'.1
     *     [1]."Column 1"
     *     [1].'Column 1'
     *     100.AB
     *     250."Column 45"
     *     10['me']
     *     [45][ZA]
     *     4"me"
     *     4AA
     * 
     *   - REGEX: `(?:^(?:([a-zA-Z]+)|(?:'(.+)')|(?:"(.+)"))(?:(?:\.(\d+))|(?:\.?\[(\d+)\]))$)|(?:^(?:(?:(\d+)\.?)|(?:\[(\d+)\]\.?))(?:([a-zA-Z]+)|(?:\[([a-zA-Z]+)\])|(?:'(.+)')|(?:"(.+)")|(?:\['(.+)'\])|(?:\["(.+)"\]))$)`
     * 
     * Path can be to a range of cells, such as 'A1:C3' to reference column A (first column), row 1 to column C (third column), row 3
     *   - if the path is to a range of cells, then the value is a `string[][]` or `Row[]` where `Row = Cell[]` and `Cell = string`
     *   - the `:` represents a block matrix of values where each row in the output has the same number of columns
     *   - the column reference can be understood as `*` (all columns) so `1:3` is the same as `*1:*3`
     *   - the notation `**:...` is understood as A1:... and `...:**` is understood as ...:<last column><last row>
     *   - meaning `**:**` returns all rows and all columns in the output
     *   - if the path is a single row, then the value is still a `string[][]` but the output will have only one row
     *   - again, 'A' is the column index alphabetically, but could also be the column name, and the same rules apply as above.
     *   - TBD: should we support non "left to right, top to bottom" ranges like 'C3:A1' or 'A3:C1' or 'C1:A3'?
     * 
     * Path can be a row such as '1' to reference row 1
     *   - if the path is to a row, then the value is a `string[]`
     * 
     * Path can be a range of rows such as `1>5` or `2-4` to reference rows 2 to 4
     *   - Note `>` is used for exclusive ranges, and `-` is used for inclusive ranges
     *   - Invalid ranges include `+`, `>`, `<`, `-`, or a combination of multiple ranges in any path, like `<2-5`, `+-3`, etc.
     *   - The `<` between two numbers is not a valid path, instead use `>` for exclusive ranges.
     *   - If the last character is `-`, `>` or `<` then the path is invalid
     *   - If the last character is '+' then the range is from the number before the `+` to the last row, so `5+` is the same as `5-10` if there are 10 rows
     *   - If the first character is `<` then the range is from the first row to the row before the number after the `<`, so `<5` is the same as `1-4`
     *   - If the first character is `>`, then the range is from the after the number after the `>` to the last row, so `>5` is the same as `6+`
     *   - If the first character is `-`, then the range is from the last n rows, so `-3` is the same as `8+` or `8-10` if there are 10 rows
     *   - if the path is to a range of rows, then the value is a `string[][]`
     *   - the result is NOT a block matrix, so each row in the output can have a different number of columns
     *   - TBD: should we support non "top to bottom" ranges like `5>1` or `5-2`?
     * 
     *   - Examples:
     *     10>50
     *     20-40
     *     <40
     *     >50
     *     -20
     *     20+
     * 
     *   - REGEX: `(?:^(\d+)(\+?)$)|(?:^([<>-])(\d+)$)|(?:^(\d+)([->])(\d+)$)`
     * 
     *   - TBD: should we support columns in the range like `D1>F5` or `B1-4` or `3-C5` with an understood `*` for the first column and last column? So `2-4` === `*2-*4`
     *     - I don't think so because the regex would be too complicated and I don't think it's a common use case.
     * 
     * Path can be a column such as 'A' to reference column A (first column)
     *   - if the path is to a column, then the value is a `string[]`
     *   - Note 'A' is the column index alphabetically, but could also be the column name.
     *   - if the column name contains a number or spaces, then the column name must be (single or double) quoted like:
     *     - '"Column 1"' or "'Column 1'"
     * 
     *   - REGEX: ^(?:([a-zA-Z]+)|(?:'(.+)')|(?:"(.+)"))$
     * 
     * A path can be a range of columns such as 'A|C' to reference columns A (first column) to C (third column)
     *   - if the path is to a range of columns, then the value is a `string[][]` or `Column[]` where `Column = Cell[]` and `Cell = string`
     *   - the `|` represents a block matrix of values where each column in the output has the same number of rows
     *   - the outer array is the columns, and the inner array is the rows, opposite of the `:` range matrix
     *   - the row reference is understood as `*` (all rows) so `A|C` is the same as `A*|C*`
     *   - row references are allowed, so `A1|C3` is valid
     *   - the notation `**|...` is understood as A1|... and `...|**` is understood as ...|<last column><last row>
     *   - meaning `**|**` returns all rows and all columns in the output
     *   - if the path is a single column, then the value is still a `string[][]` but the output will have only one column
     *   - again, 'A' is the column index alphabetically, but could also be the column name, and the same rules apply as above.
     */
  }
  constructor(
    msg?: string | string[][],
    options: {
      delimiter?: string,
      escapeChar?: string,
      quoteChar?: string,
      rowDelimiter?: '\r' | '\n'| '\r\n',
    } = {}
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
      if (parsed.meta.linebreak === '\r\n' || parsed.meta.linebreak === '\n' || parsed.meta.linebreak === '\r') {
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
  }
  setJSON = (
    _path: string | undefined,
    _json: Record<string, string>[] | Record<string, string> | string | string[] | string[][],
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
    })
  }
  json = <N extends boolean>(
    normalized?: N,
  ): N extends true ? string[][] : Record<string, string>[] => {
    const msg = cloneDeep(this._msg);
    return (normalized ? msg : this.parse(this.toString(), {
      delimiter: this.delimiter,
      escapeChar: this.escapeChar,
      quoteChar: this.quoteChar,
      newline: this.rowDelimiter,
      header: true,
    })) as N extends true
      ? string[][]
      : Record<string, string>[];
  };
  set = (
    _path?: string,
    _value?: Record<string, string>[] | Record<string, string> | string | string[] | string[][],
  ): IDelimitedMsg => {
    // TODO: implement set method
    return this;
  };
  get = (_path?: string) => {
    // TODO: implement get method
    return undefined;
  };
  delete = (_path: string): IDelimitedMsg => {
    // TODO: implement delete method
    return this;
  };
  copy = (_path: string, _toPath: string): IDelimitedMsg => {
    // TODO: implement copy method
    return this;
  };
  move = (fromPath: string, toPath: string): IDelimitedMsg => {
    this.copy(fromPath, toPath);
    this.delete(fromPath);
    return this;
  };
  map = (
    _path: string,
    _value: string | string[] | string[][] | Record<string, string> | Record<string, string>[] | (<T>(v: T, i: number) => T),
    _options?: {
      iteration?: boolean | undefined;
    },
  ): IDelimitedMsg => {
    // TODO: implement map method
    return this;
  }
  setIteration = <Y>(
    path: string,
    map: Y[] | ((val: Y, i: number) => Y),
    options?: { allowLoop: boolean },
  ): IDelimitedMsg => {
    // TODO: implement setIteration method
    return this;
  }
}

