import "mocha";
import * as chai from "chai";

import { concatArrays, hexToArray, utf8ToArray } from "@walletconnect/encoding";
import {
  testHmacSign,
  testHmacVerify,
  TEST_MESSAGE_STR,
  TEST_PRIVATE_KEY,
  TEST_FIXED_IV,
  TEST_HMAC_SIG,
} from "./common";

describe("HMAC", () => {
  const msg = utf8ToArray(TEST_MESSAGE_STR);
  const iv = hexToArray(TEST_FIXED_IV);
  const key = hexToArray(TEST_PRIVATE_KEY);
  const macKey = concatArrays(iv, key);
  const dataToMac = concatArrays(iv, key, msg);
  const expectedLength = 32;
  const expectedOutput = hexToArray(TEST_HMAC_SIG);

  let output: Uint8Array;

  before(async () => {
    output = await testHmacSign(macKey, dataToMac);
  });

  it("should sign sucessfully", async () => {
    chai.expect(output).to.eql(expectedOutput);
  });

  it("should output with expected length", async () => {
    chai.expect(output.length).to.eql(expectedLength);
  });

  it("should verify sucessfully", async () => {
    const macGood = await testHmacVerify(macKey, dataToMac, output);
    chai.expect(macGood).to.not.be.undefined;
  });
});
