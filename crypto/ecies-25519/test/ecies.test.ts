import { arrayToUtf8, hexToArray } from 'enc-utils';
import * as ecies25519 from '../src';
import {
  testGenerateKeyPair,
  testEncrypt,
  testSharedKeys,
  TEST_PRIVATE_KEY,
  TEST_PUBLIC_KEY,
  TEST_ENTROPY,
} from './common';

describe('ECIES', () => {
  const entropy = hexToArray(TEST_ENTROPY);
  let keyPair: ecies25519.KeyPair;

  beforeEach(() => {
    keyPair = testGenerateKeyPair();
  });

  it('should generate the same key pair for given entropy', async () => {
    const keyPair = await ecies25519.generateKeyPair(entropy);
    expect(keyPair).toBeTruthy();
    expect(keyPair.privateKey).toEqual(hexToArray(TEST_PRIVATE_KEY));
    expect(keyPair.publicKey).toEqual(hexToArray(TEST_PUBLIC_KEY));
  });

  it('should derive shared keys succesfully', async () => {
    const { sharedKey1, sharedKey2 } = await testSharedKeys();
    expect(sharedKey1).toBeTruthy();
    expect(sharedKey2).toBeTruthy();
    expect(sharedKey1).toEqual(sharedKey2);
  });

  it('should encrypt successfully', async () => {
    const { encrypted } = await testEncrypt(keyPair.publicKey);
    expect(encrypted).toBeTruthy();
  });

  it('should decrypt successfully', async () => {
    const { encrypted } = await testEncrypt(keyPair.publicKey);
    const decrypted = await ecies25519.decrypt(encrypted, keyPair.privateKey);
    expect(decrypted).toBeTruthy();
  });

  it('decrypted result should match input', async () => {
    const { str, msg, encrypted } = await testEncrypt(keyPair.publicKey);

    const decrypted = await ecies25519.decrypt(encrypted, keyPair.privateKey);
    expect(decrypted).toBeTruthy();

    const text = arrayToUtf8(decrypted);
    expect(decrypted).toEqual(msg);
    expect(text).toEqual(str);
  });

  it('should serialize & deserialize successfully', async () => {
    const { encrypted } = await testEncrypt(keyPair.publicKey);
    const expectedLength = encrypted.length;
    const deserialized = ecies25519.deserialize(encrypted);
    const serialized = ecies25519.serialize(deserialized);
    expect(serialized).toBeTruthy();
    expect(serialized.length).toEqual(expectedLength);
  });
});
