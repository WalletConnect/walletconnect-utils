import "mocha";
import * as chai from "chai";
import { Crypto } from "@peculiar/webcrypto";

import * as nodeCrypto from "../src/lib/node";
import * as browserCrypto from "../src/lib/browser";
import * as fallbackCrypto from "../src/lib/fallback";
import {
  testRandomBytes,
  getTestMessageToEncrypt,
  TEST_MESSAGE_STR,
  TEST_SHA256_HASH,
  TEST_SHA512_HASH,
  TEST_PRIVATE_KEY,
  TEST_FIXED_IV,
  TEST_HMAC_SIG,
} from "./common";
import { concatArrays, hexToArray, utf8ToArray } from "@walletconnect/encoding";

global.crypto = new Crypto();

describe("Fallback", () => {
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

    it("should encrypt successfully", async () => {
      const ciphertext = fallbackCrypto.fallbackAesEncrypt(iv, key, data);
      chai.expect(ciphertext).to.not.be.undefined;
    });

    it("should decrypt successfully", async () => {
      const ciphertext = fallbackCrypto.fallbackAesEncrypt(iv, key, data);
      const result = fallbackCrypto.fallbackAesDecrypt(iv, key, ciphertext);
      chai.expect(result).to.not.be.undefined;
      chai.expect(result).to.eql(data);
    });

    it("ciphertext should be decrypted by NodeJS", async () => {
      const ciphertext = fallbackCrypto.fallbackAesEncrypt(iv, key, data);
      const result = nodeCrypto.nodeAesDecrypt(iv, key, ciphertext);
      chai.expect(result).to.not.be.undefined;
      chai.expect(result).to.eql(data);
    });

    it("should decrypt ciphertext from NodeJS", async () => {
      const ciphertext = nodeCrypto.nodeAesEncrypt(iv, key, data);
      const result = fallbackCrypto.fallbackAesDecrypt(iv, key, ciphertext);
      chai.expect(result).to.not.be.undefined;
      chai.expect(result).to.eql(data);
    });

    it("ciphertext should be decrypted by Browser", async () => {
      const ciphertext = fallbackCrypto.fallbackAesEncrypt(iv, key, data);
      const result = await browserCrypto.browserAesDecrypt(iv, key, ciphertext);
      chai.expect(result).to.not.be.undefined;
      chai.expect(result).to.eql(data);
    });

    it("should decrypt ciphertext from Browser", async () => {
      const ciphertext = await browserCrypto.browserAesEncrypt(iv, key, data);
      const result = fallbackCrypto.fallbackAesDecrypt(iv, key, ciphertext);
      chai.expect(result).to.not.be.undefined;
      chai.expect(result).to.eql(data);
    });
  });

  describe("SHA2", () => {
    describe("SHA256", () => {
      let expectedLength: number;
      let expectedOutput: Uint8Array;

      before(async () => {
        expectedLength = 32;
        expectedOutput = hexToArray(TEST_SHA256_HASH);
      });
      it("should hash buffer sucessfully", async () => {
        const input = utf8ToArray(TEST_MESSAGE_STR);
        const output = fallbackCrypto.fallbackSha256(input);
        chai.expect(output).to.eql(expectedOutput);
      });

      it("should output with expected length", async () => {
        const input = utf8ToArray(TEST_MESSAGE_STR);
        const output = fallbackCrypto.fallbackSha256(input);
        chai.expect(output.length).to.eql(expectedLength);
      });
    });

    describe("SHA512", () => {
      let expectedLength: number;
      let expectedOutput: Uint8Array;

      before(async () => {
        expectedLength = 64;
        expectedOutput = hexToArray(TEST_SHA512_HASH);
      });

      it("should hash buffer sucessfully", async () => {
        const input = utf8ToArray(TEST_MESSAGE_STR);
        const output = fallbackCrypto.fallbackSha512(input);
        chai.expect(output).to.eql(expectedOutput);
      });

      it("should output with expected length", async () => {
        const input = utf8ToArray(TEST_MESSAGE_STR);
        const output = fallbackCrypto.fallbackSha512(input);
        chai.expect(output.length).to.eql(expectedLength);
      });
    });
  });

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
      output = fallbackCrypto.fallbackHmacSha256Sign(macKey, dataToMac);
    });

    it("should sign sucessfully", async () => {
      chai.expect(output).to.eql(expectedOutput);
    });

    it("should output with expected length", async () => {
      chai.expect(output.length).to.eql(expectedLength);
    });
  });
});
