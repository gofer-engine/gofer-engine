import { cloneDeep } from "lodash";
import { parsePath } from "./parsePath";
import { fixEmptyCells } from "./fixEmptyCells";

export type DelimitedValue =
  | Record<string, string[]>
  | Record<string, string>
  | string
  | string[]
  | string[][];

const isTwoDimensionalArray = (value: DelimitedValue): value is string[][] => {
  if (!Array.isArray(value)) {
    return false;
  }
  if (value.length === 0) {
    return true;
  }
  return value.every(v => {
    if (!Array.isArray(v)) {
      return false;
    }
    if (v.length === 0) {
      return true;
    }
    return v.every(vv => typeof vv === 'string')
  })
}

const isOneDimensionalArray = (value: DelimitedValue): value is string[] => {
  if (!Array.isArray(value)) {
    return false;
  }
  if (value.length === 0) {
    return true;
  }
  return value.every(v => typeof v === 'string')
}

export const setData = (
  readOnlyMsg: string[][],
  value: DelimitedValue,
  path?: string,
): string[][] => {
  let msg = cloneDeep(readOnlyMsg);
  const parsedPath = parsePath(path, msg?.[0]);
  let { row, column } = parsedPath;
  const { matrix } = parsedPath;

  // if row is undefined and column is undefined, then throw error
  if (row === undefined && column === undefined) {
    throw new Error(`Invalid path: ${path}`);
  }
  
  // if row is a negative number, then convert to `[msg.length + row]` and continue below
  if (row && !Array.isArray(row) && row < 0) {
    row = [msg.length + row]
  }
  
  // if column is a negative number, then convert to `[Math.max(...msg.map(row => row.length) + column]` and continue below
  if (column && !Array.isArray(column) && column < 0) {
    column = [Math.max(...msg.map(row => row.length)) + column]
  }
  
  // if row is non-negative number and column is non-negative number, then value should be a string
  if (
    !Array.isArray(row) &&
    row !== undefined &&
    row >= 0 &&
    !Array.isArray(column) &&
    column !== undefined &&
    column >= 0
  ) {
    if (typeof value !== 'string') {
      throw new Error(`Invalid value, expected value to be a string for path: ${path}`);
    }
    msg[row][column] = value as string;
    return msg;
  }

  // if row is non-negative number and column is undefined, then value should be type sting[] (row slice)
  if (row !== undefined && !Array.isArray(row) && row >= 0 && column === undefined) {
    if (!Array.isArray(value)) {
      throw new Error(`Invalid value, expected value to be an array for path: ${path}`);
    }
    if (value.every(v => typeof v !== 'string')) {
      throw new Error(`Invalid value, expected value to be an array of strings for path: ${path}`);
    }
    msg[row] = value as string[];
    return msg;
  }

  // if row is undefined and column is non-negative number, then value should be type string[] (column slice), this replaces each n row col[x] with value[n]
  if (column !== undefined && !Array.isArray(column) && column >= 0 && row === undefined) {
    if (!isOneDimensionalArray(value)) {
      throw new Error(`Invalid value, expected value to be an array of strings for path: ${path}`);
    }

    if (value.length !== msg.length) {
      throw new Error(`Invalid value, expected value to have ${msg.length} rows for path: ${path}`);
    }
    const c = column;
    return msg.map((r, i) => {
      r[c] = value[i];
      return r;
    })
  }

  // if row is array then value should be type string[][] (rows of columns)
  if (Array.isArray(row)) {
    if (!isTwoDimensionalArray(value)) {
      throw new Error(`Invalid value, expected value to be an array of arrays of strings for path: ${path}`);
    }
    
    // if not column matric and row length is 2, then value should have the same number of rows as `row[1] - row[0] + 1`
    if (matrix !== 'column' && row.length > 1) {
      if (value.length !== row[1] - row[0] + 1) {
        throw new Error(`Invalid value, expected value to have ${row[1] - row[0] + 1} rows for path: ${path}`);
      }
    }

    // if column is a number, then the inner most array of strings should only have length of 1
    if (!Array.isArray(column) && column !== undefined) {
      if (value.every(v => v.length !== 1)) {
        throw new Error(`Invalid value, expected value to have only one column for path: ${path}`);
      }
    }

    // if row matrix and column is an array with 2 items, then the inner most array of strings should have the same length as `column[1] - column[0] + 1`
    if (matrix=='row' && Array.isArray(column) && column.length > 1) {
      if (value.every(v => v.length !== column[1] - column[0] + 1)) {
        throw new Error(`Invalid value, expected value to have ${column[1] - column[0] + 1} columns for path: ${path}`);
      }
    }

    // if column matrix and column is an array with 2 items, then the outer array should have the same length as `column[1] - column[0] + 1`
    if (matrix=='column' && Array.isArray(column) && column.length > 1) {
      if (value.length !== column[1] - column[0] + 1) {
        throw new Error(`Invalid value, expected value to have ${column[1] - column[0] + 1} columns for path: ${path}`);
      }
    }

    // if not matrix and column is an array with 2 items, then there is no limit on the number of inner most array of strings.
    if (!matrix && Array.isArray(column) && column.length > 1) {
      // check that value is of type string[][]

      // the last row of value should have the same number of columns as `column[1]`
      if (value[value.length - 1].length !== column[1] + 1) {
        throw new Error(`Invalid value, expected value's last row to have ${column[1]} columns for path: ${path}`);
      }
      
      // This begins by replacing msg[row[0]][column[0]] with value[0][0], then msg[row[0]][column[0]+n] with value[0][n]
      msg[row[0]] = [...msg[row[0]].slice(0, column[0]), ...value[0]]

      // console.log(JSON.stringify(msg))

      // create a temp variable to contain the data from value except the first and last row
      const data = value.slice(1, value.length - 1)
      // console.log({data})

      // create a temp variable to contain the data from msg up to row[0]
      const pre = msg.slice(0, row[0] + 1)
      // console.log({pre})

      // create a temp variable to contain the row of msg at row[1]
      // and replaced up to msg[row[1]][column[1]] with ...value[value.length - 1],
      const mid = [...value[value.length - 1], ...msg[row[1]].slice(column[1] + 1)]
      // console.log({mid})

      // create a temp variable to contain the data from msg after row[1]
      const post = msg.slice(row[1] + 1)
      // console.log({post})

      // then the following rows are replaced with value rows exactly,
      return [...pre, ...data, mid, ...post]
    }

    if (matrix === 'row') {
      if (
        !Array.isArray(row) || row.length !== 2 ||
        !Array.isArray(column) || column.length !== 2
      ) {
        // shouldn't ever get here because if matris then row and column should be arrays with 2 items
        // so this is just a sanity/type check here
        throw new Error(`Invalid path: ${path}`);
      }
      // for each row, replace msg[row[0]+n][column[0]+m] with value[n][m]
      value.forEach((r, x) => {
        r.forEach((c, y) => {
          msg[x + row[0]][y + column[0]] = c;
        })
      })

      return fixEmptyCells(msg);
    }

    if (matrix === 'column') {
      if (
        !Array.isArray(row) || row.length !== 2 ||
        !Array.isArray(column) || column.length !== 2
      ) {
        // shouldn't ever get here because if matris then row and column should be arrays with 2 items
        // so this is just a sanity/type check here
        throw new Error(`Invalid path: ${path}`);
      }
      // for each row, replace msg[row[0]+n][column[0]+m] with value[n][m]
      value.forEach((col, y) => {
        col.forEach((c, x) => {
          msg[x + row[0]][y + column[0]] = c;
        })
      })

      return fixEmptyCells(msg);
    }

    // if column is an array with 1 item, then the inner most arrays of strings has no limit on the number of columns, this replaces column(s) `column[0]+` with ...msg[n]
    if (Array.isArray(column) && column.length === 1) {
      msg = msg.map((r, i) => {
        return [...r.slice(0, column[0]), ...value[i],]
      })
      return msg;
    }

    // if row length is 1, then value has no limit on the number of rows, this replaces row(s) `row[0]+` with ...value
    if (Array.isArray(row) && row.length === 1) {
      msg = [...msg.slice(0, row[0]), ...value]
      return msg;
    }

    // if column is undefined, then there is no limit on number of inner most array of strings, this replaces all columns with ...value[n]
    if (column === undefined) {
      return msg.map((_r, i) => {
        return value[i]
      });
    }
  
  }
  return msg;
};
