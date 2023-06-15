import surreal, { IDBStoreOptions as surrealOpts } from './stores/surreal'
import file, { IDBStoreOptions as fileOpts } from './stores/file'
import mongo, { IDBStoreOptions as mongoOpts } from './stores/mongo'
import dgraph, { IDBStoreOptions as dgraphOpts } from './stores/dgraph'
import { RequireOnlyOne } from './types'

const stores = {
  surreal,
  file,
  mongo,
  dgraph,
} as const

export interface StoreOptions {
  file: fileOpts
  surreal: surrealOpts
  mongo: mongoOpts
  dgraph : dgraphOpts
}

export type StoreTypes = keyof typeof stores

export type Store = surreal | file | mongo | dgraph

export type StoreConfig = RequireOnlyOne<StoreOptions>

export default stores
