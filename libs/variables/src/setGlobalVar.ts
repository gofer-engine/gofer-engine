import { vars } from "./vars";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const setGlobalVar = <V = any>(varName: string, varValue: V) =>
  vars.setVar('global', undefined, varName, varValue);
