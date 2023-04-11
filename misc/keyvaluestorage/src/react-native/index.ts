import AsyncStorage from "@react-native-async-storage/async-storage";
import { safeJsonParse, safeJsonStringify } from "@walletconnect/safe-json";

import { parseEntry, IKeyValueStorage } from "../shared";

export class KeyValueStorage implements IKeyValueStorage {
  private readonly asyncStorage = AsyncStorage;

  public async getKeys(): Promise<string[]> {
    // AsyncStorage.getAllKeys technically has `Promise<readonly string[]>` as return type.
    // Using an explicit cast here to avoid the `readonly` causing breakage with `IKeyValueStorage`.
    return this.asyncStorage.getAllKeys() as Promise<string[]>;
  }

  public async getEntries<T = any>(): Promise<[string, T][]> {
    const keys = await this.getKeys();
    const entries = await this.asyncStorage.multiGet(keys);
    return entries.map(parseEntry);
  }

  public async getItem<T = any>(key: string): Promise<T | undefined> {
    const item = await this.asyncStorage.getItem(key);
    if (typeof item === "undefined" || item === null) {
      return undefined;
    }
    // TODO: fix this annoying type casting
    return safeJsonParse(item) as T;
  }

  public async setItem<T = any>(key: string, value: T): Promise<void> {
    await this.asyncStorage.setItem(key, safeJsonStringify(value));
  }

  public async removeItem(key: string): Promise<void> {
    await this.asyncStorage.removeItem(key);
  }
}

export default KeyValueStorage;
