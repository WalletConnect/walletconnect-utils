import { safeJsonStringify } from "@walletconnect/safe-json";

function importLib() {
  try {
    const db = require("unstorage");
    const driver = require("unstorage/drivers/fs-lite");
    return {
      db,
      driver,
    };
  } catch (e) {
    // User didn't install db dependency, show detailed error
    throw new Error(
      `To use WalletConnect server side, you'll need to install the "unstorage" dependency. If you are seeing this error during a build / in an SSR environment, you can add "unstorage" as a devDependency to make this error go away.`,
    );
  }
}

interface DbKeyValueStorageOptions {
  dbName: string;
}

let StorageLib: any;
type ActionType = "setItem" | "removeItem";
type UpdateType = {
  state: "active" | "idle";
  actions: {
    key: string;
    value: unknown;
    action: ActionType;
    callback: (value: void | PromiseLike<void>) => void;
  }[];
};
export const MEMORY_DB = ":memory:";

export default class Db {
  private static instances: Record<string, Db> = {};
  public database;
  private writeActionsQueue: UpdateType = {
    state: "idle",
    actions: [],
  };

  private constructor(opts: DbKeyValueStorageOptions) {
    if (!StorageLib) {
      StorageLib = importLib();
    }

    if (opts?.dbName === MEMORY_DB) {
      this.database = StorageLib.db.createStorage();
    } else {
      this.database = StorageLib.db.createStorage({
        driver: StorageLib.driver({
          base: opts?.dbName,
        }),
      });
    }
  }

  public static create(opts: DbKeyValueStorageOptions): Db {
    const dbName = opts.dbName;
    if (dbName === MEMORY_DB) {
      return new Db(opts);
    }

    if (!Db.instances[dbName]) {
      Db.instances[dbName] = new Db(opts);
    }
    return Db.instances[dbName];
  }

  public async getKeys(): Promise<string[]> {
    return this.database.getKeys();
  }

  public async getEntries<T = any>(): Promise<[string, T][]> {
    const entries = await this.database.getItems(await this.database.getKeys());
    return entries.map((item: any) => [item.key, item.value] as [string, T]);
  }

  private async onWriteAction(params: {
    key: string;
    value?: unknown;
    action: ActionType;
  }): Promise<void> {
    const { key, value, action } = params;
    let resolveLock: (value: void | PromiseLike<void>) => void = () => ({});
    const lock = new Promise<void>((resolve) => (resolveLock = resolve));
    this.writeActionsQueue.actions.push({ key, value, action, callback: resolveLock });
    if (this.writeActionsQueue.state === "idle") {
      this.startWriteActions();
    }
    await lock;
  }

  private async startWriteActions(): Promise<void> {
    if (this.writeActionsQueue.actions.length === 0) {
      this.writeActionsQueue.state = "idle";
      return;
    }
    this.writeActionsQueue.state = "active";
    while (this.writeActionsQueue.actions.length > 0) {
      const writeAction = this.writeActionsQueue.actions.shift();
      if (!writeAction) continue;
      const { key, value, action, callback } = writeAction;
      switch (action) {
        case "setItem":
          await this.database.setItem(key);
          await this.database.setItem(key, safeJsonStringify(value));
          break;
        case "removeItem":
          await this.database.removeItem(key);
          break;
      }
      callback();
    }
    this.writeActionsQueue.state = "idle";
  }

  public async getItem<T = any>(key: string): Promise<T | undefined> {
    const item = await this.database.getItem(key);
    if (item === null) {
      return undefined;
    }
    return item as T;
  }

  public async setItem<_T = any>(key: string, value: any): Promise<void> {
    await this.onWriteAction({ key, value, action: "setItem" });
  }

  public async removeItem(key: string): Promise<void> {
    await this.onWriteAction({ key, action: "removeItem" });
  }
}
