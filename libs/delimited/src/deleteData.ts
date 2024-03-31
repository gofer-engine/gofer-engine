import { cloneDeep } from 'lodash';
import { parsePath } from './parsePath';

export const deleteData = (
  readOnlyMsg: string[][],
  path: string,
): string[][] => {
  let msg = cloneDeep(readOnlyMsg);
  const parsedPath = parsePath(path, msg?.[0]);
  const { matrix } = parsedPath;
  let { row, column } = parsedPath;

  if (row === undefined && column === undefined) {
    throw new Error(`Invalid path: ${path}`);
  }

  if (typeof row === 'number' && row < 0) {
    row = [msg.length + row];
  }

  if (typeof column === 'number' && column < 0) {
    column = [Math.max(...msg.map((row) => row.length)) + column];
  }

  if (typeof row === 'number') {
    if (typeof column === 'number') {
      msg[row].splice(column, 1);
    } else if (column === undefined) {
      msg.splice(row, 1);
    } else if (column.length === 1) {
      msg[row] = msg[row].slice(0, column[0] + 1);
    } else if (column.length === 2) {
      msg[row] = msg[row].splice(column[0], column[1] - column[0] + 1);
    }
    return msg;
  }

  if (Array.isArray(row)) {
    if (row.length === 1) {
      if (column === undefined) {
        msg = msg.slice(0, row[0]);
      }
      if (Array.isArray(column)) {
        const cols = column;
        const prevRows = msg.slice(0, row[0]);
        const modRows = msg.slice(row[0] + 1);
        modRows.map((r) => {
          if (cols.length === 1) {
            return r.slice(column[0]);
          }
          if (cols.length === 2) {
            r.splice(column[0], column[1] - column[0] + 1);
            return r;
          }
        });
        return [...prevRows, ...modRows];
      }
    }
    if (row.length === 2) {
      if (column === undefined) {
        msg.splice(row[0], row[1] - row[0] + 1);
        return msg;
      }

      const prevRows = msg.slice(0, row[0]);
      let modRows = msg.slice(row[0], row[1] + 1);
      const postRows = msg.slice(row[1] + 1);
      if (typeof column === 'number') {
        const col = column;
        modRows.forEach((r) => {
          r.splice(col, 1);
        });
        return [...prevRows, ...modRows, ...postRows];
      }

      if (Array.isArray(column)) {
        const cols = column;

        if (cols.length === 1) {
          modRows = modRows.map((r) => {
            return r.slice(cols[0]);
          });
          return [...prevRows, ...modRows, ...postRows];
        }

        if (cols.length === 2) {
          if (!matrix) {
            modRows = [
              modRows[0].slice(0, cols[0]),
              modRows[modRows.length - 1].slice(cols[1] + 1),
            ];
            return [...prevRows, ...modRows, ...postRows];
          }

          if (matrix) {
            modRows.forEach((r) => {
              r.splice(cols[0], cols[1] - cols[0] + 1);
            });
            return [...prevRows, ...modRows, ...postRows];
          }
        }
      }
    }
  }

  if (row === undefined) {
    if (typeof column === 'number') {
      const col = column;
      msg.forEach((r) => {
        r.splice(col, 1);
      });
      return msg;
    }
    if (Array.isArray(column)) {
      const cols = column;
      if (cols.length === 1) {
        msg = msg.map((r) => {
          return r.slice(cols[0]);
        });
        return msg;
      }
      if (cols.length === 2) {
        msg = msg.map((r) => {
          r.splice(cols[0], cols[1] - cols[0] + 1);
          return r;
        });
        return msg;
      }
    }
  }

  return msg;
};
