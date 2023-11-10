import { IKeyValueStorage, KeyValueStorageOptions } from "../shared";

import Db from "./lib/db";
import { beforeMigrate, migrate } from "./lib/nodeMigration";
const DB_NAME = "walletconnect.db";
export class KeyValueStorage implements IKeyValueStorage {
  private database: typeof Db.prototype;
  private initialized = false;

  constructor(opts?: KeyValueStorageOptions) {
    const dbName = opts?.database || opts?.table || DB_NAME;
    beforeMigrate(dbName);
    this.database = Db.create({
      dbName,
    });
    migrate(dbName, this.database, this.setInitialized);
  }

  private setInitialized = () => {
    this.initialized = true;
  };

  public async getKeys(): Promise<string[]> {
    await this.initialize();
    return this.database.getKeys();
  }

  public async getEntries<T = any>(): Promise<[string, T][]> {
    await this.initialize();
    return this.database.getEntries();
  }

  public async getItem<T = any>(key: string): Promise<T | undefined> {
    await this.initialize();
    return this.database.getItem(key);
  }

  public async setItem<_T = any>(key: string, value: any): Promise<void> {
    await this.initialize();
    await this.database.setItem(key, value);
  }

  public async removeItem(key: string): Promise<void> {
    await this.initialize();
    await this.database.removeItem(key);
  }

  private async initialize() {
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
}

export default KeyValueStorage;
