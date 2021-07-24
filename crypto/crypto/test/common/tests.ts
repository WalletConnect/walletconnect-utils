import crypto from "crypto";
import * as encUtils from "@walletconnect/encoding";

import * as isoCrypto from "../../src/node";
import { TEST_MESSAGE_STR } from "./constants";

export async function testSha2(msg: Uint8Array, algo: string) {
  // @ts-ignore
  const shaMethod = isoCrypto[algo];
  const hash: Uint8Array = shaMethod
    ? await shaMethod(msg)
    : crypto
        .createHash(algo)
        .update(msg)
        .digest();

  return hash;
}

export function testRandomBytes(length: number) {
  return isoCrypto.randomBytes(length);
}

export function testAesEncrypt(
  iv: Uint8Array,
  key: Uint8Array,
  data: Uint8Array
) {
  return isoCrypto.aesCbcEncrypt(iv, key, data);
}

export function testAesDecrypt(
  iv: Uint8Array,
  key: Uint8Array,
  data: Uint8Array
) {
  return isoCrypto.aesCbcDecrypt(iv, key, data);
}

export async function testHmacSign(key: Uint8Array, data: Uint8Array) {
  return isoCrypto.hmacSha256Sign(key, data);
}

export function testHmacVerify(
  key: Uint8Array,
  data: Uint8Array,
  sig: Uint8Array
) {
  return isoCrypto.hmacSha256Verify(key, data, sig);
}

export function getTestMessageToEncrypt(str = TEST_MESSAGE_STR) {
  return { str, msg: encUtils.utf8ToArray(str) };
}
