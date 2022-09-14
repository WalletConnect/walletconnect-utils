import { safeJsonParse, safeJsonStringify } from "safe-json-utils";

import { IKeyValueStorage, KeyValueStorageOptions } from "../shared";

import Db from "./db";

export class KeyValueStorage implements IKeyValueStorage {
  private db;
  private database;
  private initialized = false;
  private inMemory = false;
  constructor(opts?: KeyValueStorageOptions) {
    // flag it so we don't manually save to file
    if (opts?.database == ":memory:") {
      this.inMemory = true;
    }
    const instance = Db.create({
      ...opts,
      callback: this.databaseInitialize,
    });
    this.db = instance.database;
    this.databaseInitialize(this.db);
  }

  databaseInitialize = (db: any) => {
    if (db) {
      this.db = db;
    }
    this.database = this.db.getCollection("entries");
    if (this.database === null) {
      this.database = this.db.addCollection("entries", { unique: ["id"] });
    }
    this.initialized = true;
  };

  public async getKeys(): Promise<string[]> {
    await this.initilization();
    const keys = (await this.database.find()).map(
      (item: { id: string }) => item.id as String
    );
    return keys;
  }

  public async getEntries<T = any>(): Promise<[string, T][]> {
    await this.initilization();
    const entries = (await this.database.find()).map(
      (item: { id: string; value: string }) =>
        [item.id, safeJsonParse(item.value)] as [string, T]
    );
    return entries;
  }

  public async getItem<T = any>(key: string): Promise<T | undefined> {
    await this.initilization();
    const item = this.database.findOne({ id: { $eq: key } });
    if (item === null) {
      return undefined;
    }
    return safeJsonParse(item.value) as T;
  }

  public async setItem<T = any>(key: string, value: any): Promise<void> {
    await this.initilization();
    const item = this.database.findOne({ id: { $eq: key } });
    if (item) {
      item.value = safeJsonStringify(value);
      this.database.update(item);
    } else {
      this.database.insert({ id: key, value: safeJsonStringify(value) });
    }
    await this.persist();
  }

  public async removeItem(key: string): Promise<void> {
    await this.initilization();
    const item = this.database.findOne({ id: { $eq: key } });
    await this.database.remove(item);
    await this.persist();
  }

  private async initilization() {
    if (this.initialized) {
      return;
    }
    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (this.initialized) {
          clearInterval(interval);
          resolve();
        }
      }, 20);
    });
  }

  private async persist() {
    if (this.inMemory) return;
    this.db.saveDatabase();
  }
}

export default KeyValueStorage;
