import { vars } from "./vars";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const setRouteVar =
  (routeID: string | number) =>
  <V = any>(varName: string, varValue: V) =>
    vars.setVar('route', routeID, varName, varValue);
