import { vars } from "./vars";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getRouteVar =
  (routeID: string | number) =>
  <V = any>(varName: string) =>
    vars.getVar<V>('route', routeID, varName);
