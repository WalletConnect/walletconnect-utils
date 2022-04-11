import merge from "deepmerge";

import { IAsyncStorage, AsyncStorageTypes } from "../../src/react-native/types";

/**
 * Ported from NPM package mock-async-storage source code
 * https://github.com/devmetal/mock-async-storage/blob/0a13a4b0a15fcc5bb0bef5db7f74af7a333071d2/src/mockAsyncStorage.ts
 *
 * name: mock-async-storage
 * description: Its a mock of react-native AsyncStorage for jest tests
 * version: 2.0.5
 * author: Metál Ádám <devmetal91@gmail.com> (https://github.com/devmetal)
 * license: MIT
 *
 */

const isStringified = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

class AsyncDict<K, V> {
  store: Map<K, V | null>;

  size(): number {
    return this.store.size;
  }

  getStore(): Map<K, V | null> {
    return new Map(this.store);
  }

  constructor() {
    this.store = new Map();
  }

  async getItem(k: K, cb?: AsyncStorageTypes.ErrBack<V>): Promise<V | null> {
    const val = this.store.get(k) || null;
    if (cb) cb(null, val);
    return val;
  }

  async setItem(k: K, v: V, cb?: AsyncStorageTypes.ErrBack<V>): Promise<void> {
    this.store.set(k, v);
    if (cb) cb(null);
  }

  async removeItem(k: K, cb?: AsyncStorageTypes.ErrBack<V>): Promise<void> {
    this.store.delete(k);
    if (cb) cb(null);
  }

  async clear(cb?: AsyncStorageTypes.ErrBack<V>): Promise<void> {
    this.store.clear();
    if (cb) cb(null);
  }

  async getAllKeys(
    cb?: AsyncStorageTypes.ErrBack<Array<K>>
  ): Promise<Array<K>> {
    const keys: Array<K> = Array.from(this.store.keys());
    if (cb) cb(null, keys);
    return keys;
  }

  async multiGet(
    keys: Array<K>,
    cb?: AsyncStorageTypes.ErrBack<AsyncStorageTypes.Entries<K, V>>
  ): Promise<AsyncStorageTypes.Entries<K, V>> {
    const requested: AsyncStorageTypes.Entries<K, V> = keys.map(k => [
      k,
      this.store.get(k) || null,
    ]);
    if (cb) cb(null, requested);
    return requested;
  }

  async multiSet(
    entries: AsyncStorageTypes.Entries<K, V>,
    cb?: AsyncStorageTypes.ErrBack<V>
  ): Promise<void> {
    for (const [key, value] of entries) {
      this.store.set(key, value);
    }
    if (cb) cb(null);
  }

  async multiRemove(
    keys: Array<K>,
    cb?: AsyncStorageTypes.ErrBack<V>
  ): Promise<void> {
    for (const key of keys) {
      this.store.delete(key);
    }
    if (cb) cb(null);
  }
}

export class MockAsyncStorage extends AsyncDict<string, string>
  implements IAsyncStorage {
  async mergeItem(
    key: string,
    value: string,
    cb?: AsyncStorageTypes.ErrBack<string>
  ): Promise<void> {
    const item: string | null = await this.getItem(key);

    if (!item) throw new Error(`No item with ${key} key`);
    if (!isStringified(item)) throw new Error(`Invalid item with ${key} key`);
    if (!isStringified(value))
      throw new Error(`Invalid value to merge with ${key}`);

    const itemObj: Record<string, any> = JSON.parse(item);
    const valueObj: Record<string, any> = JSON.parse(value);
    const merged: Record<string, any> = merge(itemObj, valueObj);

    await this.setItem(key, JSON.stringify(merged));

    if (cb) cb(null);
  }

  async multiMerge(
    entries: AsyncStorageTypes.Entries<string, string>,
    cb?: AsyncStorageTypes.ArrErrBack<string>
  ): Promise<void> {
    const errors: Array<Error> = [];
    /* eslint no-restricted-syntax: "off" */
    /* eslint no-await-in-loop: "off" */
    for (const [key, value] of entries) {
      try {
        if (value) {
          await this.mergeItem(key, value);
        }
      } catch (err) {
        errors.push(err);
      }
    }

    if (errors.length) {
      if (cb) cb(errors);
      return Promise.reject(errors);
    }

    if (cb) cb(null);
    return Promise.resolve();
  }

  flushGetRequests() {
    // empty
  }
}
