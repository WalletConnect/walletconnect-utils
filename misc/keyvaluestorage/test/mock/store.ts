import KeyValueStorage from "../../src/node-js";

export class MockStore {
  constructor(public storage: KeyValueStorage) {
    this.storage = storage;
  }

  public async get<T = any>(key: string): Promise<T | undefined> {
    return this.storage.getItem(key);
  }

  public async set<T = any>(key: string, value: any): Promise<void> {
    return this.storage.setItem<T>(key, value);
  }

  public async del(key: string): Promise<void> {
    return this.storage.removeItem(key);
  }
}
