import "mocha";
import * as chai from "chai";
import { Crypto } from "@peculiar/webcrypto";

import * as nodeCrypto from "../src/node";

global.crypto = new Crypto();

describe("NodeJS", () => {
  describe("RandomBytes", () => {
    let length: number;
    let key: Uint8Array;

    before(async () => {
      length = 32;
      key = nodeCrypto.randomBytes(length);
    });

    it("should generate random bytes sucessfully", async () => {
      chai.expect(key).to.not.be.undefined;
    });

    it("should match request byte length", async () => {
      chai.expect(key.length).to.eql(length);
    });
  });
});
