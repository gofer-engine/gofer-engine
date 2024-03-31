export const fixEmptyCells = (msg: string[][]): string[][] => {
  for (let x = 0; x < msg.length; x++) {
    for (let y = 0; y < msg[x].length; y++) {
      if (typeof msg?.[x]?.[y] !== 'string') {
        msg[x][y] = '';
      }
    }
  }
  return msg;
};
