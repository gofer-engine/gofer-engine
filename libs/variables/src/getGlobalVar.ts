import { vars } from "./vars";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getGlobalVar = <V = any>(varName: string) =>
  vars.getVar<V>('global', undefined, varName);
