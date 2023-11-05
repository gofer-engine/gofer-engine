export const atLeastOnePass = (res: Record<string, boolean>) =>
  Object.values(res).some((v) => v);
