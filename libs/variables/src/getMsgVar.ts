import { vars } from "./vars";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getMsgVar =
  (messageID: string | number) =>
  <V = any>(varName: string) =>
    vars.getVar<V>('message', messageID, varName);
