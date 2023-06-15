import { randomUUID } from 'crypto'
import { env } from 'process'
import Surreal from 'surrealdb.js'
import { IStoreClass, StoreFunc, StoreOption } from '../types'
import { AnyAuth } from 'surrealdb.js/script/types'

// Install SurrealDB: https://surrealdb.com/install

export interface IDBStoreOptions extends StoreOption {
  uri?: string
  user?: string
  pass?: string
  warnOnError?: boolean
  verbose?: boolean
  namespace?: string
  database?: string
  table?: string
  // whether or not to use the normalized JSON or the loose JSON.
  // loose JSON is the default.
  // normalized JSON is the same
  normalized?: boolean
}

const { envUser, envPpass } = {
  envUser: env['SURREALDB_USER'],
  envPpass: env['SURREALDB_PASS'],
}

export interface StoreOptions {
  table?: string
  namespace?: string
  database?: string
  verbose?: boolean
}

class DBStore implements IStoreClass {
  private db: Surreal
  private credentials: AnyAuth
  private warnOnError: NonNullable<IDBStoreOptions['warnOnError']>
  private verbose: NonNullable<IDBStoreOptions['verbose']>
  private namespace: NonNullable<IDBStoreOptions['namespace']>
  private database: NonNullable<IDBStoreOptions['database']>
  private table: NonNullable<IDBStoreOptions['table']>
  private id: NonNullable<IDBStoreOptions['id']>
  private normalized: NonNullable<IDBStoreOptions['normalized']>
  constructor({
    uri = 'http://127.0.0.1:8000/rpc',
    user,
    pass,
    warnOnError = false,
    verbose = false,
    namespace = 'test',
    database = 'test',
    table = 'test',
    id = '$MSH-10.1',
    normalized = false,
  }: IDBStoreOptions = {}) {
    this.warnOnError = warnOnError
    this.verbose = verbose
    this.namespace = namespace
    this.database = database
    this.table = table
    this.id = id
    user = user ?? envUser ?? 'root'
    pass = pass ?? envPpass ?? 'root'
    this.credentials = { user, pass }
    this.db = new Surreal(uri)
    this.normalized = normalized
  }
  public store: StoreFunc = async (data) => {
    const namespace = this.namespace.match(/^\$[A-Z][A-Z0-9]{2}/)
      ? (data.get(this.namespace.slice(1) ?? this.namespace) as string)
      : this.namespace
    const database = this.database.match(/^\$[A-Z][A-Z0-9]{2}/)
      ? (data.get(this.database.slice(1) ?? this.database) as string)
      : this.database
    const table = this.table.match(/^\$[A-Z][A-Z0-9]{2}/)
      ? (data.get(this.table.slice(1) ?? this.table) as string)
      : this.table
    const id =
      this.id === 'UUID'
        ? randomUUID()
        : this.id.match(/^\$[A-Z][A-Z0-9]{2}/)
        ? (data.get(this.id.slice(1) ?? randomUUID()) as string)
        : this.id
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<boolean>(async (res, rej) => {
      try {
        await this.db.signin(this.credentials)
        await this.db.use({
          ns: namespace, 
          db: database
        })
        const identifier = id ? `${table}:⟨${id}⟩` : table
        const contents = this.normalized
          ? data.json(true)
          : { meta: data.json()[0], msg: data.json()?.[1] }
        const created = await this.db.create(identifier, contents)
        if (this.verbose)
          // @ts-expect-error the typing of created is currently wrong in the surrealdb.js package
          console.log(`Created ID: ${created.id} in ${namespace}:${database}`)
        res(true)
      } catch (error) {
        if (this.warnOnError) {
          console.warn(error)
          res(false)
        } else {
          rej(error)
        }
      }
    })
  }
  public close = async () => {
    this.db.close()
  }
  public query = (query: string, vars?: Record<string, unknown>) => this.db.query(query, vars)
}

export default DBStore
