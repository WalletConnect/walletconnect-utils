import { safeJsonParse, safeJsonStringify } from "@walletconnect/safe-json";
import localStorage from "./lib/localStorage";

import { IKeyValueStorage, parseEntry } from "../shared";

export class KeyValueStorage implements IKeyValueStorage {
  private readonly localStorage: Storage = localStorage;

  public async getKeys(): Promise<string[]> {
    return Object.keys(this.localStorage);
  }

  public async getEntries<T = any>(): Promise<[string, T][]> {
    return Object.entries(this.localStorage).map(parseEntry);
  }

  public async getItem<T = any>(key: string): Promise<T | undefined> {
    const item = this.localStorage.getItem(key);
    if (item === null) {
      return undefined;
    }
    // TODO: fix this annoying type casting
    return safeJsonParse(item) as T;
  }

  public async setItem<T = any>(key: string, value: T): Promise<void> {
    this.localStorage.setItem(key, safeJsonStringify(value));
  }

  public async removeItem(key: string): Promise<void> {
    this.localStorage.removeItem(key);
  }
}

export default KeyValueStorage;
