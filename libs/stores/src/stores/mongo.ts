import { Collection, MongoClient, MongoClientOptions } from 'mongodb';
import { IStoreClass, StoreFunc, StoreOption } from '../types';
import { randomUUID } from 'crypto';

// Install MongoDB: https://docs.mongodb.com/manual/installation/

export interface IDBStoreOptions extends StoreOption {
  uri?: string;
  options?: MongoClientOptions;
  database?: string;
  collection?: string;
  warnOnError?: boolean;
  // whether or not to use the normalized JSON or the loose JSON.
  // loose JSON is the default.
  // normalized JSON is the same
  normalized?: boolean;
}

class DBStore implements IStoreClass {
  private db: MongoClient;
  private warnOnError: NonNullable<IDBStoreOptions['warnOnError']>;
  private verbose: NonNullable<IDBStoreOptions['verbose']>;
  private database: IDBStoreOptions['database'];
  private collection: NonNullable<IDBStoreOptions['collection']>;
  private id: IDBStoreOptions['id'];
  private client: MongoClient | undefined;
  private normalized: NonNullable<IDBStoreOptions['normalized']>;
  constructor({
    uri = 'mongodb://127.0.0.1:27017',
    options,
    warnOnError = false,
    verbose = false,
    database,
    collection = 'test',
    id,
    normalized = true,
  }: IDBStoreOptions = {}) {
    this.warnOnError = warnOnError;
    this.verbose = verbose;
    this.collection = collection;
    this.id = id;
    this.db = new MongoClient(uri, options);
    this.database = database;
    this.normalized = normalized;
  }
  public store: StoreFunc = async (data) => {
    const collectionName = this.collection.match(/^\$[A-Z][A-Z0-9]{2}/)
      ? (data.get(this.collection.slice(1) ?? this.collection) as string)
      : this.collection;
    const id =
      this.id === undefined
        ? undefined
        : this.id === 'UUID'
        ? randomUUID()
        : this.id.match(/^\$[A-Z][A-Z0-9]{2}/)
        ? (data.get(this.id.slice(1) ?? randomUUID()) as string)
        : this.id;
    const database =
      this.database === undefined
        ? undefined
        : this.database.match(/^\$[A-Z][A-Z0-9]{2}/)
        ? (data.get(this.database.slice(1) ?? this.database) as string)
        : this.database;
    return new Promise<boolean>((res, rej) => {
      try {
        if (!this.client) {
          this.db.connect().then((client) => {
            this.client = client;
            const collection = this.client
              .db(database)
              .collection(collectionName);
            const contents: Record<string, unknown> = this.normalized
              ? data.json(true)
              : { meta: data.json()[0], msg: data.json()?.[1] };
            contents['_id'] = id;
            collection.insertOne(contents).then((created) => {
              if (created.acknowledged) {
                if (this.verbose)
                  console.log(
                    `Created ID: ${created.insertedId} in ${database}:${collectionName}`,
                  );
                return res(true);
              } else {
                if (this.warnOnError) {
                  console.warn(
                    `Failed to create ID: "${id}" in ${database}:${collectionName}`,
                  );
                  res(false);
                }
              }
            });
          });
        }
      } catch (error) {
        if (this.warnOnError) {
          console.warn(error);
          res(false);
        } else {
          rej(error);
        }
      }
    });
  };
  public close = async () => {
    this.db.close();
  };
  public query = async <D extends Document>(
    collection: string,
    db?: string,
    cb?: (collection: Collection<D>) => Promise<unknown>,
  ) => {
    if (!this.client) {
      this.client = await this.db.connect();
    }
    const col = this.client.db(db).collection<D>(collection);
    if (cb) {
      return cb(col);
    } else {
      return col.find();
    }
  };
}

export default DBStore;
