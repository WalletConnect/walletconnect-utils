import "mocha";
import * as chai from "chai";

import { testRandomBytes } from "./common";

describe("RandomBytes", () => {
  let length: number;
  let key: Uint8Array;

  before(async () => {
    length = 32;
    key = testRandomBytes(length);
  });

  it("should generate random bytes sucessfully", async () => {
    chai.expect(key).to.not.be.undefined;
  });

  it("should match request byte length", async () => {
    chai.expect(key.length).to.eql(length);
  });
});
