import { concatArrays, hexToArray, utf8ToArray } from 'enc-utils';
import {
  testHmacSign,
  testHmacVerify,
  TEST_MESSAGE_STR,
  TEST_PRIVATE_KEY,
  TEST_FIXED_IV,
  TEST_HMAC_SIG,
} from './common';

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
    output = await testHmacSign(macKey, dataToMac);
  });

  it('should sign sucessfully', async () => {
    expect(output).toEqual(expectedOutput);
  });

  it('should output with expected length', async () => {
    expect(output.length).toEqual(expectedLength);
  });

  it('should verify sucessfully', async () => {
    const macGood = await testHmacVerify(macKey, dataToMac, output);
    expect(macGood).toBeTruthy();
  });
});
