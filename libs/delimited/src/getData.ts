import { cloneDeep, unzip, zip } from "lodash";
import { parsePath } from "./parsePath";

export const getData = (msg: string[][], path?: string): undefined | string | string[] | string[][] => {
  try {
    const { row, column, matrix } = parsePath(path, msg?.[0]);
    // console.log({ path, row, column, matrix })
    if (row === undefined && column === undefined) {
      return undefined;
    }
    let data = cloneDeep(msg);
    if (!matrix) {
      // console.log(JSON.stringify(data))
      if (!Array.isArray(row) && row !== undefined && row >= 0) {
        const rowData = data[row]
        if (!Array.isArray(column) && column !== undefined && column >= 0) {
          return rowData?.[column]
        }
        return rowData
      }
      if (row === undefined) {
        if (!Array.isArray(column) && column >= 0) {
          return data.map((row) => row?.[column] || '')
        }
      }
    }
    if (Array.isArray(row)) {
      const slices = [...row]
      if (slices.length > 1) {
        slices[1] += 1
      }
      data = data.slice(...slices)
      // console.log(JSON.stringify(data))
    } else if (row && row < 0) {
      data = data.slice(row)
    } else if (row !== undefined) {
      data = data.slice(row, row + 1)
    }
    // add empty rows if the row doesn't exist
    if (Array.isArray(row) && row.length > 1) {
      const existingRows = data.length
      const neededRows = row[1] - row[0] + 1
      const missingRows = neededRows - existingRows
      // console.log({ existingRows, neededRows, missingRows })
      if (missingRows > 0) {
        data = data.concat(Array(missingRows).fill([]))
      }
    }
    // console.log(JSON.stringify(data))
    if (!matrix) {
      // if not a matrix, then the column slice is only for the start of the first row and the end of the last row
      const firstSlice = Array.isArray(column) ? column[0] : column
      const lastSlice = Array.isArray(column) ? column?.[1] : column
      // console.log({ firstSlice, lastSlice })
      if (data.length === 0) {
        return data;
      } else if (data.length === 1) {
        // console.log(JSON.stringify(data))
        data[0] = data[0].slice(firstSlice, lastSlice + 1)
        // console.log(JSON.stringify(data))
      } else {
        if (firstSlice) {
          data[0] = data[0].slice(firstSlice)
        }
        // console.log(JSON.stringify(data))
        if (lastSlice !== undefined) {
          if (lastSlice < 0) {
            data[data.length - 1] = data[data.length - 1].slice(lastSlice)
            // console.log(JSON.stringify(data))
          } else {
            // console.log(JSON.stringify(data[data.length - 1]))
            // console.log(JSON.stringify(data))
            data[data.length - 1] = data[data.length - 1].slice(0, lastSlice + 1)
            // console.log(JSON.stringify(data))
          }
        }
      }
      return data
    } else {
      // if matrix, then the column slice is for each row
      if (Array.isArray(column)) {
        const slices = [...column]
        if (slices.length > 1) {
          slices[1] += 1
        }
        data = data.map((row) => row.slice(...slices))
      } else if (column && column < 0) {
        data = data.map((row) => row.slice(column))
      } else if (column !== undefined) {
        data = data.map((row) => row.slice(column, column + 1))
      }
    }
    // console.log(JSON.stringify(data))
    
    // fill each row that doesn't have the max number of columns with empty strings
    const maxColumns = Math.max(...data.map((row) => row.length))
    const columns = Array.isArray(column) && column.length > 1 ? column[1] - column[0] + 1 : Array.isArray(column) ? maxColumns - column[0] : 1
    data =  data.map((row) => row.concat(Array(columns - row.length).fill('')))

    // console.log(JSON.stringify(data))

    if (matrix === 'row') {
      return data
    } else if (matrix === 'column') {
      // console.log(JSON.stringify(data))
      data = unzip(data)
      // console.log(JSON.stringify(data))
      return data
    }
  } catch (err) {
    // FIXME: log error with logger instead of console.error
    console.error(err);
    return undefined;
  }
};