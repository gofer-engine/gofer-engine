import { vars } from "./vars";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const setChannelVar =
  (channelID: string | number) =>
  <V = any>(varName: string, varValue: V) =>
    vars.setVar('channel', channelID, varName, varValue);
