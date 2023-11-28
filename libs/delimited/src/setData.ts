import { parsePath } from "./parsePath";

export type DelimitedValue =
  | Record<string, string[]>
  | Record<string, string>
  | string
  | string[]
  | string[];

export const setData = (
  msg: string[][],
  value: DelimitedValue,
  path?: string,
): string[][] => {
  const { row, column, matrix } = parsePath(path, msg?.[0]);

  // if row is undefined and column is undefined, then throw error
  
  // if row is a negative number, then convert to `[msg.length + row]` and continue below
  
  // if column is a negative number, then convert to `[Math.max(...msg.map(row => row.length) + column]` and continue below
  
  // if row is non-negative number and column is non-negative number, then value should be a string

  // if row is non-negative number and column is undefined, then value should be type sting[] (row slice)

  // if row is undefined and column is non-negative number, then value should be type string[] (column slice), this replaces each n row col[x] with value[n]

  // if row is array then value should be type string[][] (rows of columns)

    // if row length is 2, then value should have the same number of rows as `row[1] - row[0] + 1`

    // if column is a number, then the inner most array of strings should only have length of 1

    // if matrix and column is an array with 2 items, then the inner most array of strings should have the same length as `column[1] - column[0] + 1`

    // if not matrix and column is an array with 2 items, then there is no limit on the number of inner most array of strings.

      // the last row of value should have the same number of columns as `column[1]`
      
      // This begins by replacing msg[row[0]][column[0]] with value[0][0], then msg[row[0]][column[0]+n] with value[0][n],
      // then the following rows are replaced with value rows exactly,
      // then the last row is replaced up to msg[row[row.length - 1]][column[1]] with value[value.length - 1][n],

    // if column is an array with 1 item, then the inner most arrays of strings has no limit on the number of columns, this replaces column(s) `column[0]+` with ...msg[n]

    // if column is undefined, then there is no limit on number of inner most array of strings, this replaces all columns with ...msg[n]

    // if row length is 1, then value has no limit on the number of rows, this replaces row(s) `row[0]+` with ...value
    
  return msg;
};
