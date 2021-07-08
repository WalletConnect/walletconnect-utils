import { Crypto } from '@peculiar/webcrypto';

import * as isoCrypto from '../src/node';
import * as nodeCrypto from '../src/lib/node';
import * as browserCrypto from '../src/lib/browser';
import * as fallbackCrypto from '../src/lib/fallback';

import {
  testRandomBytes,
  getTestMessageToEncrypt,
  TEST_MESSAGE_STR,
  TEST_SHA256_HASH,
  TEST_SHA512_HASH,
  TEST_PRIVATE_KEY,
  TEST_FIXED_IV,
  TEST_HMAC_SIG,
} from './common';
import { concatArrays, hexToArray, utf8ToArray } from 'enc-utils';

declare global {
  interface Window {
    msCrypto: Crypto;
  }
}

//  using msCrypto because Typescript was complaing read-only
window.msCrypto = new Crypto();

describe('Browser', () => {
  describe('isBrowserCryptoAvailable', () => {
    it('should return true', () => {
      const result = isoCrypto.isBrowserCryptoAvailable();
      expect(result).toBeTruthy();
    });
  });

  describe('AES', () => {
    let keyLength: number;
    let key: Uint8Array;
    let ivLength: number;
    let iv: Uint8Array;
    let data: Uint8Array;

    beforeEach(async () => {
      keyLength = 32;
      key = testRandomBytes(keyLength);
      ivLength = 16;
      iv = testRandomBytes(ivLength);
      const toEncrypt = await getTestMessageToEncrypt();
      data = toEncrypt.msg;
    });

    it('should import key from buffer successfully', async () => {
      const result = await browserCrypto.browserImportKey(key);
      expect(result).toBeTruthy();
    });

    it('should encrypt successfully', async () => {
      const ciphertext = await browserCrypto.browserAesEncrypt(iv, key, data);
      expect(ciphertext).toBeTruthy();
    });

    it('should decrypt successfully', async () => {
      const ciphertext = await browserCrypto.browserAesEncrypt(iv, key, data);
      const result = await browserCrypto.browserAesDecrypt(iv, key, ciphertext);
      expect(result).toBeTruthy();
      expect(result).toEqual(data);
    });

    it('ciphertext should be decrypted by NodeJS', async () => {
      const ciphertext = await browserCrypto.browserAesEncrypt(iv, key, data);
      const result = nodeCrypto.nodeAesDecrypt(iv, key, ciphertext);
      expect(result).toBeTruthy();
      expect(result).toEqual(data);
    });

    it('should decrypt ciphertext from NodeJS', async () => {
      const ciphertext = nodeCrypto.nodeAesEncrypt(iv, key, data);
      const result = await browserCrypto.browserAesDecrypt(iv, key, ciphertext);
      expect(result).toBeTruthy();
      expect(result).toEqual(data);
    });

    it('ciphertext should be decrypted by Fallback', async () => {
      const ciphertext = await browserCrypto.browserAesEncrypt(iv, key, data);
      const result = fallbackCrypto.fallbackAesDecrypt(iv, key, ciphertext);
      expect(result).toBeTruthy();
      expect(result).toEqual(data);
    });

    it('should decrypt ciphertext from Fallback', async () => {
      const ciphertext = fallbackCrypto.fallbackAesEncrypt(iv, key, data);
      const result = await browserCrypto.browserAesDecrypt(iv, key, ciphertext);
      expect(result).toBeTruthy();
      expect(result).toEqual(data);
    });
  });

  describe('SHA2', () => {
    describe('SHA256', () => {
      let expectedLength: number;
      let expectedOutput: Uint8Array;

      beforeEach(async () => {
        expectedLength = 32;
        expectedOutput = hexToArray(TEST_SHA256_HASH);
      });
      it('should hash buffer sucessfully', async () => {
        const input = utf8ToArray(TEST_MESSAGE_STR);
        const output = await browserCrypto.browserSha256(input);
        expect(output).toEqual(expectedOutput);
      });

      it('should output with expected length', async () => {
        const input = utf8ToArray(TEST_MESSAGE_STR);
        const output = await browserCrypto.browserSha256(input);
        expect(output.length).toEqual(expectedLength);
      });
    });

    describe('SHA512', () => {
      let expectedLength: number;
      let expectedOutput: Uint8Array;

      beforeEach(async () => {
        expectedLength = 64;
        expectedOutput = hexToArray(TEST_SHA512_HASH);
      });

      it('should hash buffer sucessfully', async () => {
        const input = utf8ToArray(TEST_MESSAGE_STR);
        const output = await browserCrypto.browserSha512(input);
        expect(output).toEqual(expectedOutput);
      });

      it('should output with expected length', async () => {
        const input = utf8ToArray(TEST_MESSAGE_STR);
        const output = await browserCrypto.browserSha512(input);
        expect(output.length).toEqual(expectedLength);
      });
    });
  });

  describe('HMAC', () => {
    const msg = utf8ToArray(TEST_MESSAGE_STR);
    const iv = hexToArray(TEST_FIXED_IV);
    const key = hexToArray(TEST_PRIVATE_KEY);
    const macKey = concatArrays(iv, key);
    const dataToMac = concatArrays(iv, key, msg);
    const expectedLength = 32;
    const expectedOutput = hexToArray(TEST_HMAC_SIG);

    let output: Uint8Array;

    beforeEach(async () => {
      output = await browserCrypto.browserHmacSha256Sign(macKey, dataToMac);
    });

    it('should sign sucessfully', async () => {
      expect(output).toEqual(expectedOutput);
    });

    it('should output with expected length', async () => {
      expect(output.length).toEqual(expectedLength);
    });
  });
});
