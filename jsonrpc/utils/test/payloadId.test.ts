import "mocha";
import * as chai from "chai";
import { delay } from "@pedrouid/timestamp";

import { payloadId } from "../src";
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
});
