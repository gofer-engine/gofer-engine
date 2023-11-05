import { vars } from "./vars";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getChannelVar =
  (channelID: string | number) =>
  <V = any>(varName: string) =>
    vars.getVar<V>('channel', channelID, varName);
