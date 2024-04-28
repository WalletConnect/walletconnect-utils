import "mocha";
import * as chai from "chai";
import { delay } from "@walletconnect/timestamp";

import { getBigIntRpcId, payloadId } from "../src";
import { findDuplicates } from "./shared";

describe("Payload Id", () => {
  it("returns a number", () => {
    const result = payloadId();
    chai.expect(!!result).to.be.true;
    chai.expect(typeof result === "number").to.be.true;
  });

  it("returns a time-based number", () => {
    const before = Date.now();
    const result = payloadId();
    const time = Math.floor(result * 1e-3);
    const after = Date.now();
    chai.expect(before <= time).to.be.true;
    chai.expect(after >= time).to.be.true;
  });

  it("returns an integer with 16 digits", () => {
    chai.expect(payloadId().toString().length).to.equal(16);
  });

  // Context: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
  it("returns a safe integer", () => {
    chai.expect(Number.isSafeInteger(payloadId())).to.be.true;
  });

  it("returns all different values", async () => {
    const results: number[] = await Promise.all(
      Array(10)
        .fill(0)
        .map(async () => {
          await delay(Math.floor(100 * Math.random()));
          return payloadId();
        }),
    );
    const duplicates = findDuplicates(results);
    chai.expect(duplicates.length === 0).to.be.true;
  });

  it("generates increasing values when called within same tick", () => {
    let i = 0;
    while (i++ < 10000) {
      const value1 = payloadId();
      const value2 = payloadId();
      const value3 = payloadId();
      const value4 = payloadId();
      if (value1 >= value2 || value2 >= value3 || value3 >= value4) {
        chai.assert.fail("Not increasing values");
      }
    }
    chai.assert.isOk("Pass");
  });

  it("generates non-repeating values when called within same tick", () => {
    let i = 0;
    while (i++ < 10000) {
      const values = [payloadId(), payloadId(), payloadId(), payloadId()];
      const set = new Set(values);
      if (set.size !== values.length) {
        chai.assert.fail("Not unique values");
      }
    }
    chai.assert.isOk("Pass");
  });
});

describe("Get BigInt Rpc Id", () => {
  it("returns a bigint", () => {
    const value = getBigIntRpcId();
    chai.expect(typeof value === "bigint").to.be.true;
  });

  it("returns a bigint with 23 digits", () => {
    chai.expect(getBigIntRpcId().toString().length).to.equal(23);
  });

  it("generates increasing values when called within same tick", () => {
    let i = 0;
    while (i++ < 10000) {
      const value1 = getBigIntRpcId();
      const value2 = getBigIntRpcId();
      const value3 = getBigIntRpcId();
      const value4 = getBigIntRpcId();
      if (value1 >= value2 || value2 >= value3 || value3 >= value4) {
        chai.assert.fail("Not increasing values");
      }
    }
    chai.assert.isOk("Pass");
  });

  it("generates non-repeating values when called within same tick", () => {
    let i = 0;
    while (i++ < 10000) {
      const values = [getBigIntRpcId(), getBigIntRpcId(), getBigIntRpcId(), getBigIntRpcId()];
      const set = new Set(values);
      if (set.size !== values.length) {
        chai.assert.fail("Not unique values");
      }
    }
    chai.assert.isOk("Pass");
  });
});
