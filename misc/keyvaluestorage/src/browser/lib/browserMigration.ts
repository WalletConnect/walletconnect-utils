import { IKeyValueStorage } from "../../shared";

const VERSION_KEY = "wc_storage_version";
const DB_VERSION = 1;

export const migrate = async (
  fromStore: IKeyValueStorage,
  toStore: IKeyValueStorage,
  callback: (store: IKeyValueStorage) => void,
) => {
  const versionKey = VERSION_KEY;
  const currentVersion = await toStore.getItem<number>(versionKey);
  if (currentVersion && currentVersion >= DB_VERSION) {
    callback(toStore);
    return;
  }
  const keys = await fromStore.getKeys();
  if (!keys.length) {
    callback(toStore);
    return;
  }
  const keysToCleanup: string[] = [];
  while (keys.length) {
    const key = keys.shift();
    if (!key) continue;
    const formattedKey = key.toLowerCase();
    if (
      formattedKey.includes("wc@") ||
      formattedKey.includes("walletconnect") ||
      formattedKey.includes("wc_") ||
      formattedKey.includes("wallet_connect")
    ) {
      const item = await fromStore.getItem(key);
      await toStore.setItem(key, item);
      keysToCleanup.push(key);
    }
  }

  await toStore.setItem(versionKey, DB_VERSION);
  callback(toStore);
  cleanup(fromStore, keysToCleanup);
};

const cleanup = async (store: IKeyValueStorage, keysToCleanup: string[]) => {
  if (!keysToCleanup.length) {
    return;
  }

  keysToCleanup.forEach(async (key: string) => {
    await store.removeItem(key);
  });
};
