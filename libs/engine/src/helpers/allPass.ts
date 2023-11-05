export const allPass = (res: Record<string, boolean>) =>
  Object.values(res).every((v) => v);
