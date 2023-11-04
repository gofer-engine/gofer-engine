type Promisable<T> = T | Promise<T>;
type UnPromised<T> = T extends Promise<infer U> ? U : T;

export const resolveObj = async <
  V = unknown,
  T extends { [s: string]: Promisable<V> } = { [s: string]: Promisable<V> },
>(
  obj: T,
  quitEarly = false,
): Promise<{ [K in keyof T]: UnPromised<T[K]> }> => {
  const processed: Promisable<(string | UnPromised<V>)[]>[] = [];
  for await (const [k, v] of Object.entries<Promisable<V>>(obj)) {
    const result = await v;
    processed.push([k, result as UnPromised<V>]);
    if (quitEarly && Boolean(result)) break;
  }
  const res = await Promise.all(processed);
  return Object.fromEntries(res) as {
    [K in keyof T]: UnPromised<T[K]>;
  };
};
