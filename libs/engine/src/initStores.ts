import stores, { Store, StoreConfig } from '@gofer-engine/stores'
import { IMsg } from '@gofer-engine/hl7'
import { hash } from './hash'
import { ChannelConfig } from './types'

const hashedStores: Record<string, Store> = {}

export const initStores = <
  Filt extends 'O' | 'F' | 'B' = 'B',
  Tran extends 'O' | 'F' | 'B' = 'B'
>(
  config: ChannelConfig<Filt, Tran, 'S'>[]
) => {
  const routeStores: StoreConfig[] = []
  config.forEach((channel) => {
    channel.ingestion.forEach((ingestion) => {
      const flow = ingestion.flow
      if (typeof flow === 'object' && flow.kind === 'store') {
        const storeConfig = { ...flow } as { kind?: 'store' } & StoreConfig
        delete storeConfig.kind
        routeStores.push(storeConfig as StoreConfig)
      }
    })
    channel.routes?.forEach((route) => {
      route.flows.forEach((flow) => {
        const config = flow.flow
        if (typeof config === 'object' && config.kind === 'store') {
          const storeConfig = { ...config } as { kind?: 'store' } & StoreConfig
          delete storeConfig.kind
          routeStores.push(storeConfig as StoreConfig)
        }
      })
    })
  })
  routeStores.forEach((storeConfig) => {
    const STORE = Object.keys(storeConfig)[0] as keyof typeof storeConfig
    const hashed = hash(storeConfig)
    if (storeConfig[STORE]?.verbose) {
      console.log(
        `Initializing ${String(STORE)} (${hashed}): ${JSON.stringify(storeConfig)}`
      )
    }
    const config = storeConfig[STORE]
    if (STORE !== undefined && config !== undefined) {
      hashedStores[hashed] = new stores[STORE](config) as Store
    }
  })
  return config
}

export const getStore = (config: StoreConfig): Store | undefined => {
  const hashed = hash(config)
  const store = hashedStores?.[hashed]
  if (config.file?.verbose || config.surreal?.verbose) {
    console.log(`Retrieving store ${hashed}: ${JSON.stringify(store)}`)
  }
  return store
}

export const store = (
  config: StoreConfig & { kind?: string },
  msg: IMsg
): Promise<boolean> => {
  const c = { ...config }
  delete c.kind
  return new Promise<boolean>((res, rej) => {
    const hashedStore = getStore(c)
    if (hashedStore === undefined)
      return rej('Store not found from initialized hashed stores')
    res(hashedStore.store(msg))
  })
}
