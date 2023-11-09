import { IKeyValueStorage } from "../shared";
import { IndexedDb } from "./lib/indexedDb";
import { LocalStore } from "./lib/localStore";
import { migrate } from "./lib/browserMigration";

export class KeyValueStorage implements IKeyValueStorage {
  private storage: IKeyValueStorage;
  private initialized = false;

  constructor() {
    const local = new LocalStore();
    this.storage = local;
    try {
      const indexed = new IndexedDb();
      migrate(local, indexed, this.setInitialized);
      // indexedDb isn't available in node env so this will throw
    } catch (e) {
      this.initialized = true;
    }
  }

  private setInitialized = (store: IKeyValueStorage) => {
    this.storage = store;
    this.initialized = true;
  };

  public async getKeys(): Promise<string[]> {
    await this.initialize();
    return this.storage.getKeys();
  }

  public async getEntries<T = any>(): Promise<[string, T][]> {
    await this.initialize();
    return this.storage.getEntries();
  }

  public async getItem<T = any>(key: string): Promise<T | undefined> {
    await this.initialize();
    return this.storage.getItem(key);
  }

  public async setItem<T = any>(key: string, value: T): Promise<void> {
    await this.initialize();
    return this.storage.setItem(key, value);
  }

  public async removeItem(key: string): Promise<void> {
    await this.initialize();
    return this.storage.removeItem(key);
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
