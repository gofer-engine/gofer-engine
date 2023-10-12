import surreal, { IDBStoreOptions as surrealOpts } from './stores/surreal';
import file, { IDBStoreOptions as fileOpts } from './stores/file';
import mongo, { IDBStoreOptions as mongoOpts } from './stores/mongo';
import dgraph, { IDBStoreOptions as dgraphOpts } from './stores/dgraph';
import postgres, { IDBStoreOptions as postgresOpts } from './stores/postgres';
import { RequireOnlyOne } from './types';

const stores = {
  surreal,
  file,
  mongo,
  dgraph,
  postgres,
} as const;

export interface StoreOptions {
  file: fileOpts;
  surreal: surrealOpts;
  mongo: mongoOpts;
  dgraph: dgraphOpts;
  postgres: postgresOpts;
}

export type StoreTypes = keyof typeof stores;

export type Store = surreal | file | mongo | dgraph | postgres;

export type StoreConfig = RequireOnlyOne<StoreOptions>;

export default stores;
