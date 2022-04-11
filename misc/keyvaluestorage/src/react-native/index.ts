import { safeJsonParse, safeJsonStringify } from "safe-json-utils";

import {
  IKeyValueStorage,
  KeyValueStorageOptions,
  getReactNativeOptions,
  parseEntry,
} from "../shared";

import { IAsyncStorage } from "./types";

export class KeyValueStorage implements IKeyValueStorage {
  private readonly asyncStorage: IAsyncStorage;

  constructor(opts?: KeyValueStorageOptions) {
    const options = getReactNativeOptions(opts);
    this.asyncStorage = options.asyncStorage;
  }

  public async getKeys(): Promise<string[]> {
    return this.asyncStorage.getAllKeys();
  }

  public async getEntries<T = any>(): Promise<[string, T][]> {
    const entries = await this.asyncStorage.multiGet(await this.getKeys());
    return entries.map(parseEntry);
  }

  public async getItem<T = any>(key: string): Promise<T | undefined> {
    const item = await this.asyncStorage.getItem(key);
    if (typeof item == "undefined" || item === null) {
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
