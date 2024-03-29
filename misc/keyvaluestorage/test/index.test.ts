/* eslint-disable no-unused-expressions */
// @ts-nocheck
import { describe, it, before } from "mocha";
import { expect } from "chai";
import proxyquire from "proxyquire";
import { delay } from "@walletconnect/time";

import BrowserStorage from "../src/browser";
import NodeJSStorage from "../src/node-js";
import { IKeyValueStorage } from "../src/shared";

import { MockStore, MockAsyncStorage } from "./mock";
import { MEMORY_DB } from "../src/node-js/lib/db";
const dbDir = "test/dbs";
const PERSISTED_NODEJS_DATABASE = `${dbDir}/walletconnect.db`;

// Mock the external `async-storage` dependency imported inside ReactNativeStorage.
const { KeyValueStorage: ReactNativeStorage } = proxyquire("../src/react-native", {
  "@react-native-async-storage/async-storage": {
    default: new MockAsyncStorage(),
  },
});

describe("KeyValueStorage", () => {
  const key = "yolo";
  const value = { name: "john doe" };
  let storage: IKeyValueStorage;

  describe("browser", () => {
    before(async () => {
      storage = new BrowserStorage();
      await storage.setItem(key, value);
    });
    it("getItem", async () => {
      const item = await storage.getItem<typeof value>(key);
      if (typeof item === "undefined") throw new Error("item is missing");
      expect(item).to.not.be.undefined;
      expect(item.name).to.not.be.undefined;
      expect(item.name).to.eql(value.name);
    });
    it("getEntries", async () => {
      const entries = await storage.getEntries();
      expect(entries).to.not.be.undefined;
      expect(entries.length).to.eql(1);
      expect(entries[0]).to.eql([key, value]);
    });
    it("getKeys", async () => {
      const keys = await storage.getKeys();
      expect(keys).to.not.be.undefined;
      expect(keys.length).to.eql(1);
      expect(keys[0]).to.eql(key);
    });
    it("removeItem", async () => {
      await storage.removeItem(key);
      const item = await storage.getItem(key);
      if (typeof item !== "undefined") throw new Error("item expected to be undefined");
      expect(!item).to.be.true;
    });
  });

  describe("react-native", () => {
    before(async () => {
      storage = new ReactNativeStorage();
      await storage.setItem(key, value);
    });
    it("getItem", async () => {
      const item = await storage.getItem<typeof value>(key);
      if (typeof item === "undefined") throw new Error("item is missing");
      expect(item).to.not.be.undefined;
      expect(item.name).to.not.be.undefined;
      expect(item.name).to.eql(value.name);
    });
    it("getEntries", async () => {
      const entries = await storage.getEntries();
      expect(entries).to.not.be.undefined;
      expect(entries.length).to.eql(1);
      expect(entries[0]).to.eql([key, value]);
    });
    it("getKeys", async () => {
      const keys = await storage.getKeys();
      expect(keys).to.not.be.undefined;
      expect(keys.length).to.eql(1);
      expect(keys[0]).to.eql(key);
    });
    it("removeItem", async () => {
      await storage.removeItem(key);
      const item = await storage.getItem(key);
      if (typeof item !== "undefined") throw new Error("item expected to be undefined");
      expect(!item).to.be.true;
    });
  });

  describe("node-js", () => {
    before(async () => {
      storage = new NodeJSStorage({ database: MEMORY_DB });
      await storage.setItem(key, value);
    });
    it("getItem", async () => {
      const item = await storage.getItem<typeof value>(key);
      if (typeof item === "undefined") throw new Error("item is missing");
      expect(item).to.not.be.undefined;
      expect(item.name).to.not.be.undefined;
      expect(item.name).to.eql(value.name);
    });
    it("getEntries", async () => {
      const entries = await storage.getEntries();
      expect(entries).to.not.be.undefined;
      expect(entries.length).to.eql(1);
      expect(entries[0]).to.eql([key, value]);
    });
    it("getKeys", async () => {
      const keys = await storage.getKeys();
      expect(keys).to.not.be.undefined;
      expect(keys.length).to.eql(1);
      expect(keys[0]).to.eql(key);
    });
    it("removeItem", async () => {
      await storage.removeItem(key);
      const item = await storage.getItem(key);
      if (typeof item !== "undefined") throw new Error("item expected to be undefined");
      expect(!item).to.be.true;
    });
  });

  describe("persistence", () => {
    it("two storages can access the same item", async () => {
      const storageA = new NodeJSStorage({
        database: PERSISTED_NODEJS_DATABASE,
      });
      await storageA.setItem(key, value);
      await storageA.setItem(key, value);
      const itemA = await storageA.getItem<typeof value>(key);
      if (typeof itemA === "undefined") throw new Error("item expected to be undefined");
      expect(itemA).to.not.be.undefined;
      expect(itemA.name).to.not.be.undefined;
      expect(itemA.name).to.eql(value.name);
      const storageB = new NodeJSStorage({
        database: PERSISTED_NODEJS_DATABASE,
      });
      const itemB = await storageB.getItem<typeof value>(key);
      if (typeof itemB === "undefined") throw new Error("item expected to be undefined");
      expect(itemB).to.not.be.undefined;
      expect(itemB.name).to.not.be.undefined;
      expect(itemB.name).to.eql(value.name);
    });
    it("two classes can share the same storage", async () => {
      const storage = new NodeJSStorage({
        database: PERSISTED_NODEJS_DATABASE,
      });
      const storeA = new MockStore(storage);
      await storeA.set(key, value);
      const itemA = await storeA.get<typeof value>(key);
      if (typeof itemA === "undefined") throw new Error("item expected to be undefined");
      expect(itemA).to.not.be.undefined;
      expect(itemA.name).to.not.be.undefined;
      expect(itemA.name).to.eql(value.name);
      const storeB = new MockStore(storage);
      const itemB = await storeB.get<typeof value>(key);
      if (typeof itemB === "undefined") throw new Error("item expected to be undefined");
      expect(itemB).to.not.be.undefined;
      expect(itemB.name).to.not.be.undefined;
      expect(itemB.name).to.eql(value.name);
    });
    it("three storages can write synchronously", async () => {
      const storageA = new NodeJSStorage({
        database: PERSISTED_NODEJS_DATABASE,
      });
      storageA.setItem(key, { ...value, owner: "storageA" });

      const storageB = new NodeJSStorage({
        database: PERSISTED_NODEJS_DATABASE,
      });
      storageB.setItem(key, { ...value, owner: "storageB" });

      const storageC = new NodeJSStorage({
        database: PERSISTED_NODEJS_DATABASE,
      });
      storageC.setItem(key, { ...value, owner: "storageC" });

      await delay(2000);

      const itemA = await storageA.getItem<typeof value>(key);

      if (typeof itemA === "undefined") throw new Error("item expected to be undefined");
      expect(itemA).to.not.be.undefined;
      expect(itemA.name).to.not.be.undefined;
      expect(itemA.name).to.eql(value.name);
      expect((itemA as any).owner).to.eql("storageC");

      const itemB = await storageB.getItem<typeof value>(key);
      if (typeof itemB === "undefined") throw new Error("item expected to be undefined");
      expect(itemB).to.not.be.undefined;
      expect(itemB.name).to.not.be.undefined;
      expect(itemB.name).to.eql(value.name);
      expect((itemB as any).owner).to.eql("storageC");

      const itemC = await storageB.getItem<typeof value>(key);
      if (typeof itemC === "undefined") throw new Error("item expected to be undefined");
      expect(itemC).to.not.be.undefined;
      expect(itemC.name).to.not.be.undefined;
      expect(itemC.name).to.eql(value.name);
      expect((itemC as any).owner).to.eql("storageC");
    });
    it("can create multiple persisted DBs", async () => {
      const dbA = `${dbDir}/a.db`;
      const dbB = `${dbDir}/b.db`;

      const storageA = new NodeJSStorage({
        database: dbA,
      });
      storageA.setItem(key, { ...value, owner: "storageA" });

      const storageB = new NodeJSStorage({
        database: dbB,
      });
      storageB.setItem(key, { ...value, owner: "storageB" });

      await delay(500);

      const itemA = await storageA.getItem<typeof value>(key);

      if (typeof itemA === "undefined") throw new Error("item expected to be undefined");
      expect(itemA).to.not.be.undefined;
      expect(itemA.name).to.not.be.undefined;
      expect(itemA.name).to.eql(value.name);
      expect((itemA as any).owner).to.eql("storageA");

      const itemB = await storageB.getItem<typeof value>(key);
      if (typeof itemB === "undefined") throw new Error("item expected to be undefined");
      expect(itemB).to.not.be.undefined;
      expect(itemB.name).to.not.be.undefined;
      expect(itemB.name).to.eql(value.name);
      expect((itemB as any).owner).to.eql("storageB");
    });
  });
});
