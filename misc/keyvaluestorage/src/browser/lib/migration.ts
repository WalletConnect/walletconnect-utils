/* eslint-disable no-console */
import { IKeyValueStorage } from "../../shared";

const VERSION_KEY = "wc_storage_version";

export const migrate = async (
  fromStore: IKeyValueStorage,
  toStore: IKeyValueStorage,
  version: number,
  callback: (store: IKeyValueStorage) => void,
) => {
  console.log("🚢 migrate: start");
  const versionKey = VERSION_KEY;
  const currentVersion = await toStore.getItem<number>(versionKey);
  if (currentVersion && currentVersion >= version) {
    console.log("🚢 migrate: already migrated");
    callback(toStore);
    return;
  }
  console.log("🚢 migrate: start");
  const keys = await fromStore.getKeys();
  if (!keys.length) {
    console.log("🚢 migrate: no keys");
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
    } else {
      console.log("🚢 migrate: skipping key", key);
    }
  }

  await toStore.setItem(versionKey, version);
  console.log("🚢 migrate: complete");
  console.log("cleanup: keys", keysToCleanup.length);
  callback(toStore);
  cleanup(fromStore, keysToCleanup);
};

const cleanup = async (store: IKeyValueStorage, keysToCleanup: string[]) => {
  if (!keysToCleanup.length) {
    console.log("🧹 cleanup: no keys", keysToCleanup.length);
    return;
  }

  console.log("🧹 cleanup: start");
  keysToCleanup.forEach(async (key: string) => {
    await store.removeItem(key);
  });
  console.log("🧹 cleanup: complete");
};
