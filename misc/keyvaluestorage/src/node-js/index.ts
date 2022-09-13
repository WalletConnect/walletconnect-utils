import { safeJsonParse, safeJsonStringify } from "safe-json-utils";

import { IKeyValueStorage, KeyValueStorageOptions } from "../shared";

import loki from "lokijs";
import lfsa from "lokijs/src/loki-fs-structured-adapter";
const DB_NAME = "walletconnect.db";

export class KeyValueStorage implements IKeyValueStorage {
  private db;
  private database;
  private initialized = false;
  constructor(opts?: KeyValueStorageOptions) {
    if (opts?.database == ":memory:") {
      this.db = new loki(DB_NAME, {});
      this.databaseInitialize();
    } else {
      var adapter = new lfsa();
      this.db = new loki(opts?.database || opts?.table || DB_NAME, {
        autoload: true,
        adapter: adapter,
        autosave: true,
        autoloadCallback: this.databaseInitialize,
      });
    }
  }
  databaseInitialize = () => {
    this.database = this.db.getCollection("entries");
    if (this.database === null) {
      this.database = this.db.addCollection("entries");
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
    const item = await this.database.findOne({ id: { $eq: key } });
    if (item === null) {
      return undefined;
    }
    return safeJsonParse(item.value) as T;
  }

  public async setItem<T = any>(key: string, value: any): Promise<void> {
    await this.initilization();
    await this.database.insert({ id: key, value: safeJsonStringify(value) });
  }

  public async removeItem(key: string): Promise<void> {
    await this.initilization();
    const item = await this.database.findOne({ id: { $eq: key } });
    await this.database.remove(item);
  }

  private async initilization() {
    if (this.initialized) return;
    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (this.initialized) {
          clearInterval(interval);
          resolve();
        }
      }, 20);
    });
  }
}

export default KeyValueStorage;
