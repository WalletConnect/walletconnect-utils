import "mocha";
import * as chai from "chai";

import {
  getTestMessageToEncrypt,
  testRandomBytes,
  testAesEncrypt,
  testAesDecrypt,
} from "./common";

describe("AES", () => {
  let keyLength: number;
  let key: Uint8Array;
  let ivLength: number;
  let iv: Uint8Array;
  let data: Uint8Array;

  before(async () => {
    keyLength = 32;
    key = testRandomBytes(keyLength);
    ivLength = 16;
    iv = testRandomBytes(ivLength);
    const toEncrypt = await getTestMessageToEncrypt();
    data = toEncrypt.msg;
  });

  it("should encrypt sucessfully", async () => {
    const ciphertext = await testAesEncrypt(iv, key, data);
    chai.expect(ciphertext).to.not.be.undefined;
  });

  it("should decrypt sucessfully", async () => {
    const ciphertext = await testAesEncrypt(iv, key, data);
    const result = await testAesDecrypt(iv, key, ciphertext);
    chai.expect(result).to.not.be.undefined;
  });

  it("decrypted should match input", async () => {
    const ciphertext = await testAesEncrypt(iv, key, data);
    const result = await testAesDecrypt(iv, key, ciphertext);
    chai.expect(result).to.eql(data);
  });
});
