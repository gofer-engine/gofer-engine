type MaybePromise<T> = T | Promise<T>
type UnPromised<T> = T extends Promise<infer U> ? U : T

export const resolveObj = async <
  V = unknown,
  T extends {[s: string]: MaybePromise<V>} = {[s: string]: MaybePromise<V>},
>(
  obj: T,
  quitEarly: boolean = false,
): Promise<{[K in keyof T]: UnPromised<T[K]>}> => {
  const processed: MaybePromise<(string | UnPromised<V>)[]>[] = []
  for await (const [k, v] of Object.entries<MaybePromise<V>>(obj)) {
    const result = await v
    processed.push([k, result as UnPromised<V>])
    if (quitEarly && Boolean(result)) break
  }
  const res = await Promise.all(processed)
  return Object.fromEntries(res) as {
    [K in keyof T]: UnPromised<T[K]>
  }
}
