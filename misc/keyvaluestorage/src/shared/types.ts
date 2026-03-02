export interface KeyValueStorageOptions {
  database?: string;
  table?: string;
}

export abstract class IKeyValueStorage {
  public abstract getKeys(): Promise<string[]>;
  public abstract getEntries(): Promise<[string, unknown][]>;
  public abstract getItem<T = any>(key: string): Promise<T | undefined>;
  public abstract setItem<T = any>(key: string, value: T): Promise<void>;
  public abstract removeItem(key: string): Promise<void>;
}
