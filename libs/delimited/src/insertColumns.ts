import { cloneDeep } from "lodash";
import { fixEmptyCells } from "./fixEmptyCells";

export const insertColumns = (readOnlyMsg: string[][], index: number, columns: string[][]): string[][] => {
  const msg = cloneDeep(readOnlyMsg);
  const temp = new Array(columns.length).fill('');
  msg.forEach((row) => {
    row.splice(index, 0, ...temp);
  });
  columns.forEach((column, y) => {
    column.forEach((cell, x) => {
      if (msg[x] === undefined) {
        msg[x] = [];
      }
      msg[x][y + index] = cell;
    })
  });
  return fixEmptyCells(msg);
};
