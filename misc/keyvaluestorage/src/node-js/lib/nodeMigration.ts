import { safeJsonParse } from "@walletconnect/safe-json";
import { IKeyValueStorage } from "../../shared";
import fs from "fs";
const VERSION_KEY = "wc_storage_version";
const TO_MIGRATE_SUFFIX = ".to_migrate";
const MIGRATED_SUFFIX = ".migrated";
const MEMORY_DB = ":memory:";
const DB_VERSION = 1;

export const migrate = async (
  fromStore: string,
  toStore: IKeyValueStorage,
  onCompleteCallback: () => void,
) => {
  if (fromStore === MEMORY_DB) {
    onCompleteCallback();
    return;
  }
  console.log("🚢 migrate: start", fromStore);
  const versionKey = VERSION_KEY;
  const currentVersion = await toStore.getItem<number>(versionKey);
  if (currentVersion && currentVersion >= DB_VERSION) {
    console.log("🚢 migrate: already migrated");
    onCompleteCallback();
    return;
  }
  const rawContents = await readFile(`${fromStore}${TO_MIGRATE_SUFFIX}`);
  if (!rawContents) {
    console.log("🚢 migrate: old db file not fount");
    onCompleteCallback();
    return;
  }
  const contents = safeJsonParse(rawContents);
  if (!contents) {
    console.log("🚢 migrate: old db is empty");
    onCompleteCallback();
    return;
  }
  console.log("🚢 migrate: reading old file");
  const collection = contents?.collections?.[0];
  console.log("🚢 migrate: collection", contents.collections.length, collection.data.length);

  const items = collection?.data;
  if (!items || !items.length) {
    console.log("🚢 migrate: no data in collection");
    onCompleteCallback();
    return;
  }

  while (items.length) {
    const item = items.shift();
    if (!item) {
      console.log("🚢 migrate: no item");
      continue;
    }
    const { id, value } = item;
    console.log("🚢 migrate: item", id);
    await toStore.setItem(id, safeJsonParse(value));
  }

  await toStore.setItem(versionKey, DB_VERSION);
  console.log("🚢 migrate: done");
  renameFile(`${fromStore}${TO_MIGRATE_SUFFIX}`, `${fromStore}${MIGRATED_SUFFIX}`);
  onCompleteCallback();
};

const readFile = async (path: string) => {
  return await new Promise<string | undefined>((resolve) => {
    fs.readFile(path, { encoding: "utf8" }, (err, data) => {
      if (err) {
        console.log("🚢 migrate: error reading old file", err);
        resolve(undefined);
      }
      resolve(data);
    });
  });
};

export const beforeMigrate = (fromStore: string) => {
  if (fromStore === MEMORY_DB) return;
  console.log("🚢 beforeMigrate: start", typeof fromStore);
  if (!fs.existsSync(fromStore)) return;
  if (fs.lstatSync(fromStore).isDirectory()) return;
  console.log("🚢 beforeMigrate: exists", fromStore);
  renameFile(fromStore, `${fromStore}${TO_MIGRATE_SUFFIX}`);
};

const renameFile = (from: string, to: string) => {
  try {
    console.log("🚢 beforeMigrate: renaming", from);
    fs.renameSync(from, to);
    console.log("🚢 beforeMigrate: renamed", `${to}`);
  } catch (e) {
    console.log("🚢 beforeMigrate: error renaming", e);
  }
};
