export const AlphaIndex = (
  str: string | undefined,
  {
    index = 0,
  }: {
    index?: 0 | 1;
  } = {},
): number => {
  if (typeof str === 'string' && new RegExp(/^[a-zA-Z]+$/).test(str)) {
    str = str.toUpperCase();
    const base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = 0;
    for (let i = 0, j = str.length - 1; i < str.length; i += 1, j -= 1) {
      result += Math.pow(base.length, j) * (base.indexOf(str[i]) + 1);
    }
    return result - 1 + index;
  }
  return undefined;
};

export type ParsedPath = Readonly<{
  column?: number | number[];
  row?: number | number[];
  matrix?: 'row' | 'column';
}>;

export const parsePath = (path: string, headers: string[] = []): ParsedPath => {
  const rowRegex = new RegExp(/(?:^(\d+)$)|(?:^\[(\d+)\]$)/);
  const columnRegex = new RegExp(/^(?:([a-zA-Z]+)|(?:'(.+)')|(?:"(.+)"))$/);
  const rowRangeRegex = new RegExp(
    /(?:^(\d+)(\+?)$)|(?:^([<>-])(\d+)$)|(?:^(\d+)([->])(\d+)$)/,
  );
  const cellRegex = new RegExp(
    /(?:^(?:([a-zA-Z]+)|(?:'([^']+)')|(?:"([^"]+)"))(?:(?:\.?(\d+))|(?:\.?\[(\d+)\]))$)|(?:^(?:(?:(\d+)\.?)|(?:\[(\d+)\]\.?))(?:([a-zA-Z]+)|(?:\[([a-zA-Z]+)\])|(?:'([^']+)')|(?:"([^"]+)")|(?:\['([^']+)'\])|(?:\["([^"]+)"\]))$)/,
  );
  const rangeRegex = new RegExp(
    /^(?:(?:([a-zA-Z]+)|(?:'([^']+)')|(?:"([^"]+)"))(?:(?:\.?(\d+))|(?:\.?\[(\d+)\]))|(?:(?:(\d+)\.?)|(?:\[(\d+)\]\.?))(?:([a-zA-Z]+)|(?:\[([a-zA-Z]+)\])|(?:'([^']+)')|(?:"([^"]+)")|(?:\['([^']+)'\])|(?:\["([^"]+)"\])))([-:|])(?:(?:([a-zA-Z]+)|(?:'([^']+)')|(?:"([^"]+)"))(?:(?:\.?(\d+))|(?:\.?\[(\d+)\]))|(?:(?:(\d+)\.?)|(?:\[(\d+)\]\.?))(?:([a-zA-Z]+)|(?:\[([a-zA-Z]+)\])|(?:'([^']+)')|(?:"([^"]+)")|(?:\['([^']+)'\])|(?:\["([^"]+)"\])))$/,
  );

  const columnRangeRegex = new RegExp(
    /^(?:(?:([a-zA-Z]+)|(?:'([^']+)')|(?:"([^"]+)"))\|(?:([a-zA-Z]+)|(?:'([^']+)')|(?:"([^"]+)")))$/,
  );

  if (rowRegex.test(path)) {
    const [, ...rowNumbers] = rowRegex.exec(path);
    const rowIndex = rowNumbers.filter(i => i !== undefined)?.[0];
    return { row: parseInt(rowIndex) };
  }
  if (columnRegex.test(path)) {
    const [, columnAlpha, ...columnNames] = columnRegex.exec(path);
    let columnIndex = AlphaIndex(columnAlpha);
    const columnName = columnNames.filter(Boolean)?.[0];
    if (headers.indexOf(columnName) !== -1) {
      columnIndex = headers.indexOf(columnName);
    }
    return columnIndex !== undefined ? { column: columnIndex } : undefined;
  }
  if (rowRangeRegex.test(path)) {
    const [, start, postOp, preOp, end, min, op, max] =
      rowRangeRegex.exec(path);
    const minIndex = min !== undefined ? parseInt(min) : undefined;
    const maxIndex = max !== undefined ? parseInt(max) : undefined;
    const endIndex = end !== undefined ? parseInt(end) : undefined;
    const startIndex = start !== undefined ? parseInt(start) : undefined;
    if (
      minIndex !== undefined &&
      maxIndex !== undefined &&
      minIndex > maxIndex
    ) {
      throw new Error(`Invalid range: ${path}`);
    }
    if (op === '-' && minIndex !== undefined && maxIndex !== undefined) {
      return { row: [minIndex, maxIndex] };
    }
    if (op === '>' && minIndex !== undefined && maxIndex !== undefined) {
      if (minIndex > maxIndex) {
        throw new Error(`Invalid range: ${path}`);
      }
      return { row: [minIndex + 1, maxIndex - 1] };
    }
    if (preOp === '<' && end !== undefined) {
      return { row: [0, endIndex - 1] };
    }
    if (preOp === '>' && end !== undefined) {
      return { row: [endIndex + 1] };
    }
    if (preOp === '-' && end !== undefined) {
      return { row: 0 - endIndex };
    }
    if (postOp === '+' && start !== undefined) {
      return { row: [startIndex] };
    }
    // shouldn't ever hit this line as the rowRegex should have caught it above
    return { row: [startIndex] };
  }
  if (cellRegex.test(path)) {
    const [
      ,
      columnAlpha1,
      columnName1,
      columnName2,
      rowNumber1,
      rowNumber2,
      rowNumber3,
      rowNumber4,
      columnAlpha2,
      columnAlpha3,
      columnName3,
      columnName4,
      columnName5,
      columnName6,
    ] = cellRegex.exec(path);
    const col =
      AlphaIndex(columnAlpha1 ?? columnAlpha2 ?? columnAlpha3) ??
      columnName1 ??
      columnName2 ??
      columnName3 ??
      columnName4 ??
      columnName5 ??
      columnName6;
    const c =
      typeof col === 'number'
        ? col
        : headers.indexOf(col) !== -1
        ? headers.indexOf(col)
        : undefined;
    if (c === undefined) {
      throw new Error(`Invalid column: ${path}`);
    }
    const r = parseInt(rowNumber1 ?? rowNumber2 ?? rowNumber3 ?? rowNumber4);
    if (c !== undefined && !isNaN(r)) {
      return { column: c, row: r };
    }
  }
  if (columnRangeRegex.test(path)) {
    const [
      ,
      startColAlpha,
      startColName1,
      startColName2,
      endColAlpha,
      endColName1,
      endColName2,
    ] = columnRangeRegex.exec(path);
    let startIndex =
      AlphaIndex(startColAlpha) ?? startColName1 ?? startColName2;
    if (typeof startIndex === 'string') {
      startIndex = headers.indexOf(startIndex);
      if (startIndex === -1) {
        throw new Error(`Invalid column: ${path}`);
      }
    }
    let endIndex = AlphaIndex(endColAlpha) ?? endColName1 ?? endColName2;
    if (typeof endIndex === 'string') {
      endIndex = headers.indexOf(endIndex);
      if (endIndex === -1) {
        throw new Error(`Invalid column: ${path}`);
      }
    }
    if (startIndex !== undefined && endIndex !== undefined) {
      return { column: [startIndex, endIndex], matrix: 'column' };
    }
  }
  if (rangeRegex.test(path)) {
    const [
      ,
      startColumnAlpha1,
      startColumnName1,
      startColumnName2,
      startRowNumber1,
      startRowNumber2,
      startRowNumber3,
      startRowNumber4,
      startColumnAlpha2,
      startColumnAlpha3,
      startColumnName3,
      startColumnName4,
      startColumnName5,
      startColumnName6,
      operator,
      endColumnAlpha1,
      endColumnName1,
      endColumnName2,
      endRowNumber1,
      endRowNumber2,
      endRowNumber3,
      endRowNumber4,
      endColumnAlpha2,
      endColumnAlpha3,
      endColumnName3,
      endColumnName4,
      endColumnName5,
      endColumnName6,
    ] = rangeRegex.exec(path);
    let startColumn =
      AlphaIndex(startColumnAlpha1 ?? startColumnAlpha2 ?? startColumnAlpha3) ??
      startColumnName1 ??
      startColumnName2 ??
      startColumnName3 ??
      startColumnName4 ??
      startColumnName5 ??
      startColumnName6;
    if (typeof startColumn === 'string') {
      startColumn = headers.indexOf(startColumn);
      if (startColumn === -1) {
        throw new Error(`Invalid column: ${path}`);
      }
    }
    let startRow = parseInt(
      startRowNumber1 ?? startRowNumber2 ?? startRowNumber3 ?? startRowNumber4,
    );
    let endColumn =
      AlphaIndex(endColumnAlpha1 ?? endColumnAlpha2 ?? endColumnAlpha3) ??
      endColumnName1 ??
      endColumnName2 ??
      endColumnName3 ??
      endColumnName4 ??
      endColumnName5 ??
      endColumnName6;
    if (typeof endColumn === 'string') {
      endColumn = headers.indexOf(endColumn);
      if (endColumn === -1) {
        throw new Error(`Invalid column: ${path}`);
      }
    }
    let endRow = parseInt(
      endRowNumber1 ?? endRowNumber2 ?? endRowNumber3 ?? endRowNumber4,
    );
    const matrix =
      operator === ':' ? 'row' : operator === '|' ? 'column' : undefined;
    if (
      typeof startColumn === 'number' &&
      typeof endColumn === 'number' &&
      startColumn > endColumn &&
      matrix
    ) {
      const temp = startColumn;
      startColumn = endColumn;
      endColumn = temp;
    }
    if (!isNaN(startRow) && !isNaN(endRow) && startRow > endRow && matrix) {
      const temp = startRow;
      startRow = endRow;
      endRow = temp;
    }
    const column = [startColumn, endColumn];
    const row = [startRow, endRow];
    return { column, row, ...{ matrix } };
  }
  throw new Error(`Invalid path: ${path}`);
};
