import "mocha";
import * as chai from "chai";
import * as encUtils from "@walletconnect/encoding";

import * as eccies25519 from "../../src";
import { TEST_MESSAGE_STR } from "./constants";

export function testGenerateKeyPair() {
  const keyPair = eccies25519.generateKeyPair();
  chai.expect(keyPair.privateKey).to.not.be.undefined;
  chai.expect(keyPair.publicKey).to.not.be.undefined;
  return keyPair;
}

export async function testSharedKeys() {
  const keyPairA = testGenerateKeyPair();
  const keyPairB = testGenerateKeyPair();
  const sharedKey1 = eccies25519.derive(
    keyPairA.privateKey,
    keyPairB.publicKey
  );

  const sharedKey2 = eccies25519.derive(
    keyPairB.privateKey,
    keyPairA.publicKey
  );
  return { sharedKey1, sharedKey2 };
}

export function getTestMessageToEncrypt(str = TEST_MESSAGE_STR) {
  return { str, msg: encUtils.utf8ToArray(str) };
}

export async function testEncrypt(
  publicKey: Uint8Array,
  opts?: Partial<eccies25519.EncryptOpts>
) {
  const { str, msg } = getTestMessageToEncrypt(undefined);
  const encrypted = await eccies25519.encrypt(msg, publicKey, opts);
  return { str, msg, encrypted };
}
