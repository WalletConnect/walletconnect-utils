import { hexToArray, utf8ToArray } from 'enc-utils';
import * as isoCrypto from '../src/node';
import { TEST_MESSAGE_STR, TEST_SHA256_HASH, TEST_SHA512_HASH } from './common';

describe('SHA256', () => {
  let expectedLength: number;
  let expectedOutput: Uint8Array;

  beforeEach(async () => {
    expectedLength = 32;
    expectedOutput = hexToArray(TEST_SHA256_HASH);
  });

  it('should hash buffer sucessfully', async () => {
    const input = utf8ToArray(TEST_MESSAGE_STR);
    const output = await isoCrypto.sha256(input);
    expect(output).toEqual(expectedOutput);
  });

  it('should output with expected length', async () => {
    const input = utf8ToArray(TEST_MESSAGE_STR);
    const output = await isoCrypto.sha256(input);
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
    const output = await isoCrypto.sha512(input);
    expect(output).toEqual(expectedOutput);
  });

  it('should output with expected length', async () => {
    const input = utf8ToArray(TEST_MESSAGE_STR);
    const output = await isoCrypto.sha512(input);
    expect(output.length).toEqual(expectedLength);
  });
});
