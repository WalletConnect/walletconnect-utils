import { safeJsonParse } from "@walletconnect/safe-json";
import { IKeyValueStorage } from "../../shared";
import { MEMORY_DB } from "./db";
import fs from "fs";
const VERSION_KEY = "wc_storage_version";
const TO_MIGRATE_SUFFIX = ".to_migrate";
const MIGRATED_SUFFIX = ".migrated";
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
  const versionKey = VERSION_KEY;
  const currentVersion = await toStore.getItem<number>(versionKey);
  if (currentVersion && currentVersion >= DB_VERSION) {
    onCompleteCallback();
    return;
  }
  const rawContents = await readFile(`${fromStore}${TO_MIGRATE_SUFFIX}`);
  if (!rawContents) {
    onCompleteCallback();
    return;
  }
  const contents = safeJsonParse(rawContents);
  if (!contents) {
    onCompleteCallback();
    return;
  }
  const collection = contents?.collections?.[0];

  const items = collection?.data;
  if (!items || !items.length) {
    onCompleteCallback();
    return;
  }

  while (items.length) {
    const item = items.shift();
    if (!item) {
      continue;
    }
    const { id, value } = item;
    await toStore.setItem(id, safeJsonParse(value));
  }

  await toStore.setItem(versionKey, DB_VERSION);
  renameFile(`${fromStore}${TO_MIGRATE_SUFFIX}`, `${fromStore}${MIGRATED_SUFFIX}`);
  onCompleteCallback();
};

const readFile = async (path: string) => {
  return await new Promise<string | undefined>((resolve) => {
    fs.readFile(path, { encoding: "utf8" }, (err, data) => {
      if (err) {
        resolve(undefined);
      }
      resolve(data);
    });
  });
};

export const beforeMigrate = (fromStore: string) => {
  if (fromStore === MEMORY_DB) return;
  if (!fs.existsSync(fromStore)) return;
  if (fs.lstatSync(fromStore).isDirectory()) return;
  renameFile(fromStore, `${fromStore}${TO_MIGRATE_SUFFIX}`);
};

const renameFile = (from: string, to: string) => {
  try {
    fs.renameSync(from, to);
  } catch (e) {}
};
