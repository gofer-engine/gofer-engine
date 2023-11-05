import { Promisable } from "type-fest";

export const promisify = <D>(data: Promisable<D>) =>
  new Promise<D>((res) => res(data));
