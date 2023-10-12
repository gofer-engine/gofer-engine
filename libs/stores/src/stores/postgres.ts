import { Pool, PoolConfiguration, DataTypeOIDs } from 'postgresql-client';
import { randomUUID } from 'crypto';

import { IStoreClass, StoreFunc, StoreOption } from '../types';

export interface IDBStoreOptions extends StoreOption, PoolConfiguration {
  table?: string;
  schemaOwner?: string;
}

class DBStore implements IStoreClass {
  private readonly id: string | undefined;
  private schemaOwner: string;
  private db: Pool;
  private readonly table: string;
  private schemasReady: Record<string, boolean | null> = {};
  // public query: Pool['query'];
  public execute: Pool['execute'];
  constructor({ id, table, schemaOwner, ...config }: IDBStoreOptions = {}) {
    this.db = new Pool(config);
    // this.query = this.db.query;
    this.execute = this.db.execute;
    this.table = table ?? 'test';
    this.schemaOwner = schemaOwner ?? 'postgres';
    this.id = id;
  }

  public query = async (query: string) => {
    return this.db.query(query, { objectRows: true })
  }

  public close = async () => {
    await this.db.close();
  }

  private checkTableName = (table: string): string => {
    // compare to table name to regex for a valid postgres table name
    if (!table.match(/^[a-zA-Z_@#][^"]{0,127}$/)) {
      throw new Error(`Table name "${table}" is invalid.`);
    }
    return table;
  };

  private checkSchema = async (table: string): Promise<boolean> => {
    table = this.checkTableName(table);
    if (this.schemasReady[table]) {
      return true;
    } else if (this.schemasReady[table] === false) {
      throw new Error(`Schema for table "${table}" is invalid.`);
    } else if (this.schemasReady[table] === null) {
      await new Promise((res) => setTimeout(res, 1000));
      return this.checkSchema(table);
    } else {
      this.schemasReady[table] = null;
      const schema = await this.db.query(
        `SELECT column_name, data_type FROM information_schema.columns WHERE table_name=$1 AND column_name IN ('data', 'guid', 'id') ORDER BY column_name;`,
        { params: [table], objectRows: true, },
      );
      if (schema.rows?.length === 0) {
        await this.db.execute(
          `CREATE TABLE public."${table}" (id serial NOT NULL, guid character varying, data json NOT NULL, PRIMARY KEY (id)); ALTER TABLE IF EXISTS public."${table}" OWNER TO ${this.schemaOwner};`,
        );
        this.schemasReady[table] = true;
        return true;
      } else if (
        schema.rows?.[0]?.column_name !== 'data' ||
        schema.rows?.[0]?.data_type !== 'json' ||
        schema.rows?.[1]?.column_name !== 'guid' ||
        schema.rows?.[1]?.data_type !== 'character varying' ||
        schema.rows?.[2]?.column_name !== 'id' ||
        schema.rows?.[2]?.data_type !== 'integer'
      ) {
        console.error(
          `Schema for table "${table}" reported invalid as: ${JSON.stringify(
            schema.rows,
          )}.`,
        );
        this.schemasReady[table] = false;
        throw new Error(`Schema for table "${table}" is invalid.`);
      } else {
        this.schemasReady[table] = true;
        return true;
      }
    }
  };

  public store: StoreFunc = async (data) => {
    const id = this.id === 'UUID'
      ? randomUUID()
      : this.id?.match(/^\$[A-Z][A-Z0-9]{2}/)
      ? (data.get(this.id.slice(1)) as string)
      : undefined;
    const table = this.table.match(/^\$[A-Z][A-Z0-9]{2}/)
      ? (data.get(this.table.slice(1) ?? this.table) as string)
      : this.table;
    await this.checkSchema(table);
    // add new record
    const [meta, msg] = data.json();
    const params = [id, { meta, msg }];
    const statement = await this.db.prepare(
      `INSERT INTO public."${table}" (guid, data) VALUES ($1, $2);`,
      { paramTypes: [DataTypeOIDs.varchar, DataTypeOIDs.json] }
    );
    const insert = await statement.execute({ params });
    if (insert.rowsAffected !== 1) {
      console.error(`Failed to insert record into "${table}".`);
      return false;
    }
    return true;
  };
}

export default DBStore;
