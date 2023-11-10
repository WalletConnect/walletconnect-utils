import { createStorage } from "unstorage";
import indexedDbDriver from "unstorage/drivers/indexedb";

import { IKeyValueStorage } from "../../shared";
import { safeJsonStringify } from "@walletconnect/safe-json";

const DB_NAME = "WALLET_CONNECT_V2_INDEXED_DB";
const DB_STORE_NAME = "keyvaluestorage";

export class IndexedDb implements IKeyValueStorage {
  private indexedDb;
  constructor() {
    this.indexedDb = createStorage({
      driver: indexedDbDriver({ dbName: DB_NAME, storeName: DB_STORE_NAME }),
    });
  }

  public async getKeys(): Promise<string[]> {
    return this.indexedDb.getKeys();
  }

  public async getEntries<T = any>(): Promise<[string, T][]> {
    const entries = await this.indexedDb.getItems(await this.indexedDb.getKeys());
    return entries.map((item: any) => [item.key, item.value] as [string, T]);
  }

  public async getItem<T = any>(key: string): Promise<T | undefined> {
    const item = await this.indexedDb.getItem(key);
    if (item === null) {
      return undefined;
    }
    return item as T;
  }

  public async setItem<T = any>(key: string, value: T): Promise<void> {
    await this.indexedDb.setItem(key, safeJsonStringify(value));
  }

  public async removeItem(key: string): Promise<void> {
    await this.indexedDb.removeItem(key);
  }
}
