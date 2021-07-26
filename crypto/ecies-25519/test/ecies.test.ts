import "mocha";
import * as chai from "chai";

import { arrayToUtf8, hexToArray } from "@walletconnect/encoding";
import * as ecies25519 from "../src";
import {
  testGenerateKeyPair,
  testEncrypt,
  testSharedKeys,
  TEST_PRIVATE_KEY,
  TEST_PUBLIC_KEY,
  TEST_ENTROPY,
} from "./common";

describe("ECIES", () => {
  const entropy = hexToArray(TEST_ENTROPY);
  let keyPair: ecies25519.KeyPair;

  before(() => {
    keyPair = testGenerateKeyPair();
    chai.expect(keyPair).to.not.be.undefined;
  });

  it("should generate the same key pair for given entropy", async () => {
    const keyPair = ecies25519.generateKeyPair(entropy);
    chai.expect(keyPair).to.not.be.undefined;
    chai.expect(keyPair.privateKey).to.eql(hexToArray(TEST_PRIVATE_KEY));
    chai.expect(keyPair.publicKey).to.eql(hexToArray(TEST_PUBLIC_KEY));
  });

  it("should derive shared keys succesfully", async () => {
    const { sharedKey1, sharedKey2 } = await testSharedKeys();
    chai.expect(sharedKey1).to.not.be.undefined;
    chai.expect(sharedKey2).to.not.be.undefined;
    chai.expect(sharedKey1).to.eql(sharedKey2);
  });

  it("should encrypt successfully", async () => {
    const { encrypted } = await testEncrypt(keyPair.publicKey);
    chai.expect(encrypted).to.not.be.undefined;
  });

  it("should decrypt successfully", async () => {
    const { encrypted } = await testEncrypt(keyPair.publicKey);
    const decrypted = await ecies25519.decrypt(encrypted, keyPair.privateKey);
    chai.expect(decrypted).to.not.be.undefined;
  });

  it("decrypted result should match input", async () => {
    const { str, msg, encrypted } = await testEncrypt(keyPair.publicKey);

    const decrypted = await ecies25519.decrypt(encrypted, keyPair.privateKey);
    chai.expect(decrypted).to.not.be.undefined;

    const text = arrayToUtf8(decrypted);
    chai.expect(decrypted).to.eql(msg);
    chai.expect(text).to.eql(str);
  });

  it("should serialize & deserialize successfully", async () => {
    const { encrypted } = await testEncrypt(keyPair.publicKey);
    const expectedLength = encrypted.length;
    const deserialized = ecies25519.deserialize(encrypted);
    const serialized = ecies25519.serialize(deserialized);
    chai.expect(serialized).to.not.be.undefined;
    chai.expect(serialized.length).to.eql(expectedLength);
  });
});
