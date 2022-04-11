export declare namespace AsyncStorageTypes {
  export type Entry<K = string, V = any> = [K, V | null];

  export type Entries<K = string, V = any> = Array<Entry<K, V>>;

  export type ErrBack<V = any> = (err: Error | null, val?: V | null) => {};

  export type ArrErrBack<V = any> = (err: Array<Error> | null, val?: V) => {};
}

export abstract class IAsyncStorage<K = string, V = any> {
  public abstract store: Map<K, V | null>;

  public abstract size(): number;

  public abstract getStore(): Map<K, V | null>;

  public abstract getItem(
    k: K,
    cb?: AsyncStorageTypes.ErrBack<V>
  ): Promise<V | null>;

  public abstract setItem(
    k: K,
    v: V,
    cb?: AsyncStorageTypes.ErrBack<V>
  ): Promise<void>;

  public abstract removeItem(
    k: K,
    cb?: AsyncStorageTypes.ErrBack<V>
  ): Promise<void>;

  public abstract clear(cb?: AsyncStorageTypes.ErrBack<V>): Promise<void>;

  public abstract getAllKeys(
    cb?: AsyncStorageTypes.ErrBack<Array<K>>
  ): Promise<Array<K>>;

  public abstract multiGet(
    keys: Array<K>,
    cb?: AsyncStorageTypes.ErrBack<AsyncStorageTypes.Entries<K, V>>
  ): Promise<AsyncStorageTypes.Entries<K, V>>;

  public abstract multiSet(
    entries: AsyncStorageTypes.Entries<K, V>,
    cb?: AsyncStorageTypes.ErrBack<V>
  ): Promise<void>;

  public abstract multiRemove(
    keys: Array<K>,
    cb?: AsyncStorageTypes.ErrBack<V>
  ): Promise<void>;

  public abstract mergeItem(
    key: string,
    value: string,
    cb?: AsyncStorageTypes.ErrBack<string>
  ): Promise<void>;

  public abstract multiMerge(
    entries: AsyncStorageTypes.Entries<string, string>,
    cb?: AsyncStorageTypes.ArrErrBack<string>
  ): Promise<void>;

  public abstract flushGetRequests();
}
