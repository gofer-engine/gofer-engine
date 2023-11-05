import { vars } from "./vars";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const setMsgVar =
  (messageID: string | number) =>
  <V = any>(varName: string, varValue: V) =>
    vars.setVar('message', messageID, varName, varValue);
