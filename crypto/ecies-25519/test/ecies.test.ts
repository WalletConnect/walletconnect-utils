import "mocha";
import * as chai from "chai";

import * as encoding from "@walletconnect/encoding";
import * as ecies25519 from "../src";
import {
  testGenerateKeyPair,
  testEncrypt,
  testSharedKeys,
  TEST_KEY_PAIR,
  TEST_SHARED_KEY,
  TEST_FIXED_IV,
  TEST_ECIES_KEYS,
  TEST_DESERIALIZED,
  TEST_SERIALIZED,
} from "./common";

describe("ECIES", () => {
  const keyPairA = {
    privateKey: encoding.hexToArray(TEST_KEY_PAIR.a.privateKey),
    publicKey: encoding.hexToArray(TEST_KEY_PAIR.a.publicKey),
  };
  const keyPairB = {
    privateKey: encoding.hexToArray(TEST_KEY_PAIR.b.privateKey),
    publicKey: encoding.hexToArray(TEST_KEY_PAIR.b.publicKey),
  };

  let keyPair: ecies25519.KeyPair;

  before(() => {
    keyPair = testGenerateKeyPair();
    chai.expect(keyPair).to.not.be.undefined;
  });

  it("should generate the same key pair for given entropy", async () => {
    const privateKey = encoding.hexToArray(TEST_KEY_PAIR.a.privateKey);
    const keyPair = ecies25519.generateKeyPair(privateKey);
    chai.expect(keyPair).to.not.be.undefined;
    chai
      .expect(keyPair.privateKey)
      .to.eql(encoding.hexToArray(TEST_KEY_PAIR.a.privateKey));
    chai
      .expect(keyPair.publicKey)
      .to.eql(encoding.hexToArray(TEST_KEY_PAIR.a.publicKey));
  });

  it("should derive shared keys succesfully", async () => {
    const { sharedKey1, sharedKey2 } = await testSharedKeys(keyPairA, keyPairB);
    const sharedKey = encoding.hexToArray(TEST_SHARED_KEY);
    chai.expect(sharedKey1).to.eql(sharedKey);
    chai.expect(sharedKey2).to.eql(sharedKey);
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

    const text = encoding.arrayToUtf8(decrypted);
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
    chai.expect(serialized).to.eql(encrypted);
  });
  it("should always return the exact parameters", async () => {
    const { sharedKey1 } = await testSharedKeys(keyPairA, keyPairB);
    const { encryptionKey, macKey } = await ecies25519.getEciesKeys(sharedKey1);
    chai
      .expect(encoding.arrayToHex(encryptionKey))
      .to.eql(TEST_ECIES_KEYS.encryptionKey);
    chai.expect(encoding.arrayToHex(macKey)).to.eql(TEST_ECIES_KEYS.macKey);

    const { encrypted } = await testEncrypt(keyPairA.publicKey, {
      iv: encoding.hexToArray(TEST_FIXED_IV),
      sender: keyPairB,
    });
    chai.expect(encoding.arrayToHex(encrypted)).to.eql(TEST_SERIALIZED);

    const deserialized = ecies25519.deserialize(encrypted);
    chai
      .expect(encoding.arrayToHex(deserialized.iv))
      .to.eql(TEST_DESERIALIZED.iv);
    chai
      .expect(encoding.arrayToHex(deserialized.publicKey))
      .to.eql(TEST_DESERIALIZED.publicKey);
    chai
      .expect(encoding.arrayToHex(deserialized.mac))
      .to.eql(TEST_DESERIALIZED.mac);
    chai
      .expect(encoding.arrayToHex(deserialized.ciphertext))
      .to.eql(TEST_DESERIALIZED.ciphertext);
  });
});
