
import { safeJsonParse, safeJsonStringify } from "safe-json-utils";

import {
  IKeyValueStorage,
  KeyValueStorageOptions,
} from "../shared";
import db from "./level_db"

const DB_NAME = "walletconnect_level.db";

export class KeyValueStorage implements IKeyValueStorage {
  private database;

  constructor(opts?: KeyValueStorageOptions) {
    this.database = db.create(opts?.database || opts?.table || `${DB_NAME}`)
    if(!opts || opts.database == ':memory:') {
      this.database.clear()
    }
  }

  public async getKeys(): Promise<string[]> {
    const entries = (await this.database.iterator().all()).map(([key]) => key as string);
    return entries
  }

  public async getEntries<T = any>(): Promise<[string, T][]> {
  
    const entries = (await this.database.iterator().all()).map(([key, value]) => [key, safeJsonParse(value)] as [string, T]);
    return entries;
  }

  public async getItem<T = any>(key: string): Promise<T | undefined> {
    let item :any
    try {
     item = await this.database.get(key) 
    } catch (err) {
      /// if the key is not found, exception is thrown
      /// https://github.com/Level/abstract-level#level_not_found
      if(err.code === 'LEVEL_NOT_FOUND') {
        item = null
      } else {
        throw err;
      }
    }

    if (item === null) {
      return undefined;
    }
    // TODO: fix this annoying type casting
    return safeJsonParse(item) as T;
  }

  public async setItem<T = any>(key: string, value: any): Promise<void> {
    return this.database.put(key, safeJsonStringify(value));
  }

  public async removeItem(key: string): Promise<void> {
    return this.database.del(key);
  }
}

export default KeyValueStorage;
