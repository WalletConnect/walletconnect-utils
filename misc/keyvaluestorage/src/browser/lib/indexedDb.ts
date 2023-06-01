import { safeJsonParse, safeJsonStringify } from "@walletconnect/safe-json";

const DB_NAME = "WALLET_CONNECT_V2_INDEXED_DB";
const DB_STORE_NAME = "keyvaluestorage";
const DB_VERSION = 1;

export class IndexedDb {
  private db: IDBDatabase = {} as IDBDatabase;
  private initialized = false;
  public entries = {};

  constructor() {
    const dbRequest = window.indexedDB.open(DB_NAME, DB_VERSION);
    dbRequest.onsuccess = async () => {
      this.db = dbRequest.result;
      this.loadEntries();
      this.initialized = true;
    };
    dbRequest.onupgradeneeded = () => {
      dbRequest.result.createObjectStore(DB_STORE_NAME, {
        autoIncrement: false,
      });
    };
    dbRequest.onerror = event => {
      // eslint-disable-next-line no-console
      console.error(`IndexedDB error: ${DB_NAME}`, event);
    };
  }

  private loadEntries(): void {
    const transaction = this.db.transaction(DB_STORE_NAME, "readonly");
    const objectStore = transaction.objectStore(DB_STORE_NAME);
    objectStore.getAllKeys().onsuccess = event => {
      const keys = (event.target as IDBRequest).result;
      if (!keys?.length) return;
      const valueTransaction = this.db.transaction(DB_STORE_NAME, "readonly");
      const valueObjectStore = valueTransaction.objectStore(DB_STORE_NAME);

      keys.forEach((key: string) => {
        valueObjectStore.get(key).onsuccess = event => {
          const value = (event.target as IDBRequest).result;
          this.entries[key] = safeJsonStringify(value);
        };
      });
    };
  }

  get length() {
    return Object.keys(this.entries).length;
  }

  private async toInitialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    await new Promise<void>(resolve => {
      const interval = setInterval(() => {
        if (this.initialized) {
          clearInterval(interval);
          resolve();
        }
      }, 20);
    });
  }

  public async setItem(key: string, value: string): Promise<void> {
    await this.toInitialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db?.transaction(DB_STORE_NAME, "readwrite");
      const objectStore = transaction?.objectStore(DB_STORE_NAME);
      objectStore?.put(safeJsonParse(value), key);
      transaction.oncomplete = () => {
        this.entries[key] = value;
        resolve();
      };
      transaction.onerror = event => reject(event);
    });
  }

  public async getItem(key: string): Promise<string | null> {
    await this.toInitialize();
    return new Promise(resolve => {
      const transaction = this.db?.transaction(DB_STORE_NAME, "readonly");
      const objectStore = transaction?.objectStore(DB_STORE_NAME);
      const request = objectStore?.get(key);
      request.onsuccess = () =>
        resolve(request.result ? safeJsonStringify(request.result) : null);
      request.onerror = () => resolve(null);
    });
  }

  public async removeItem(key: string): Promise<void> {
    await this.toInitialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db?.transaction(DB_STORE_NAME, "readwrite");
      const objectStore = transaction?.objectStore(DB_STORE_NAME);
      const deleteRequest = objectStore.delete(key);
      deleteRequest.onsuccess = () => resolve();
      transaction.onerror = event => reject(event);
    });
  }

  public key(i = 0) {
    return Object.keys(this.entries)[i];
  }

  public clear() {
    const transaction = this.db.transaction(DB_STORE_NAME, "readwrite");
    const objectStore = transaction.objectStore(DB_STORE_NAME);
    objectStore.clear();
  }
}
