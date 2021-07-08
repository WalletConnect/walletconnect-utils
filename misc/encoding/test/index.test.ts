import * as encUtils from '../src/';

function compare(a: any, b: any) {
  const type = encUtils.getType(a);
  if (type !== encUtils.getType(b)) {
    return false;
  }
  if (type === 'array-buffer') {
    a = Buffer.from(a);
    b = Buffer.from(b);
  }
  return a.toString().toLowerCase() === b.toString().toLowerCase();
}

const TEST_STRING_UTF8 = 'encoding';
const TEST_STRING_HEX = '656e636f64696e67';
const TEST_STRING_BUF = Buffer.from(TEST_STRING_HEX, 'hex');
const TEST_STRING_ARR = new Uint8Array(TEST_STRING_BUF);
const TEST_STRING_BIN =
  '0110010101101110011000110110111101100100011010010110111001100111';

const TEST_NUMBER_NUM = 16;
const TEST_NUMBER_HEX = '10';
const TEST_NUMBER_UTF8 = `${TEST_NUMBER_NUM}`;
const TEST_NUMBER_BUF = Buffer.from(TEST_NUMBER_HEX, 'hex');
const TEST_NUMBER_ARR = new Uint8Array(TEST_NUMBER_BUF);
const TEST_NUMBER_BIN = '00010000';

const TEST_EMPTY_BYTES = 8;
const TEST_EMPTY_HEX = '0'.repeat(TEST_EMPTY_BYTES * 2);
const TEST_EMPTY_BUF = Buffer.from(TEST_EMPTY_HEX, 'hex');

const TEST_SIMPLE_BIN = '01010101';
const TEST_INVALID_BIN = TEST_SIMPLE_BIN.slice(1);
const TEST_SWAPPED_BIN = '10101010';
const TEST_SWAPPED_HEX = 'a676c6f6269676e6';

describe('EncUtils', () => {
  // -- Buffer ----------------------------------------------- //

  it('bufferToArray', async () => {
    const input = TEST_STRING_BUF;
    const expected = TEST_STRING_ARR;
    const result = encUtils.bufferToArray(input);
    expect(compare(result, expected)).toBeTruthy();
  });

  it('bufferToHex', async () => {
    const input = TEST_STRING_BUF;
    const expected = TEST_STRING_HEX;
    const result = encUtils.bufferToHex(input);
    expect(compare(result, expected)).toBeTruthy();
    expect(result.startsWith('0x')).toBeFalsy();
    expect(result.length % 2).toBeFalsy();
  });

  it('bufferToUtf8', async () => {
    const input = TEST_STRING_BUF;
    const expected = TEST_STRING_UTF8;
    const result = encUtils.bufferToUtf8(input);
    expect(compare(result, expected)).toBeTruthy();
  });

  it('bufferToNumber', async () => {
    const input = TEST_NUMBER_BUF;
    const expected = TEST_NUMBER_NUM;
    const result = encUtils.bufferToNumber(input);
    expect(compare(result, expected)).toBeTruthy();
  });

  it('bufferToBinary', async () => {
    const input = TEST_STRING_BUF;
    const expected = TEST_STRING_BIN;
    const result = encUtils.bufferToBinary(input);
    expect(compare(result, expected)).toBeTruthy();
  });

  // -- Uint8Array -------------------------------------------- //

  it('arrayToBuffer', async () => {
    const input = TEST_STRING_ARR;
    const expected = TEST_STRING_BUF;
    const result = encUtils.arrayToBuffer(input);
    expect(compare(result, expected)).toBeTruthy();
  });

  it('arrayToHex', async () => {
    const input = TEST_STRING_ARR;
    const expected = TEST_STRING_HEX;
    const result = encUtils.arrayToHex(input);
    expect(compare(result, expected)).toBeTruthy();
    expect(result.startsWith('0x')).toBeFalsy();
    expect(result.length % 2).toBeFalsy();
  });

  it('arrayToUtf8', async () => {
    const input = TEST_STRING_ARR;
    const expected = TEST_STRING_UTF8;
    const result = encUtils.arrayToUtf8(input);
    expect(compare(result, expected)).toBeTruthy();
  });

  it('arrayToNumber', async () => {
    const input = TEST_NUMBER_ARR;
    const expected = TEST_NUMBER_NUM;
    const result = encUtils.arrayToNumber(input);
    expect(compare(result, expected)).toBeTruthy();
  });

  it('arrayToBinary', async () => {
    const input = TEST_STRING_ARR;
    const expected = TEST_STRING_BIN;
    const result = encUtils.arrayToBinary(input);
    expect(compare(result, expected)).toBeTruthy();
  });

  // -- Hex -------------------------------------------------- //

  it('hexToBuffer', async () => {
    const input = TEST_STRING_HEX;
    const expected = TEST_STRING_BUF;
    const result = encUtils.hexToBuffer(input);
    expect(compare(result, expected)).toBeTruthy();
  });

  it('hexToArray', async () => {
    const input = TEST_NUMBER_HEX;
    const expected = TEST_NUMBER_ARR;
    const result = encUtils.hexToArray(input);
    expect(compare(result, expected)).toBeTruthy();
  });

  it('hexToUtf8', async () => {
    const input = TEST_STRING_HEX;
    const expected = TEST_STRING_UTF8;
    const result = encUtils.hexToUtf8(input);
    expect(compare(result, expected)).toBeTruthy();
  });

  it('hexToNumber', async () => {
    const input = TEST_NUMBER_HEX;
    const expected = TEST_NUMBER_NUM;
    const result = encUtils.hexToNumber(input);
    expect(compare(result, expected)).toBeTruthy();
  });

  it('hexToBinary', async () => {
    const input = TEST_STRING_HEX;
    const expected = TEST_STRING_BIN;
    const result = encUtils.hexToBinary(input);
    expect(compare(result, expected)).toBeTruthy();
  });

  // -- Utf8 ------------------------------------------------- //

  it('utf8ToBuffer', async () => {
    const input = TEST_STRING_UTF8;
    const expected = TEST_STRING_BUF;
    const result = encUtils.utf8ToBuffer(input);
    expect(compare(result, expected)).toBeTruthy();
  });

  it('utf8ToArray', async () => {
    const input = TEST_STRING_UTF8;
    const expected = TEST_STRING_ARR;
    const result = encUtils.utf8ToArray(input);
    expect(compare(result, expected)).toBeTruthy();
  });

  it('utf8ToHex', async () => {
    const input = TEST_STRING_UTF8;
    const expected = TEST_STRING_HEX;
    const result = encUtils.utf8ToHex(input);
    expect(compare(result, expected)).toBeTruthy();
    expect(result.startsWith('0x')).toBeFalsy();
    expect(result.length % 2).toBeFalsy();
  });

  it('utf8ToNumber', async () => {
    const input = TEST_NUMBER_UTF8;
    const expected = TEST_NUMBER_NUM;
    const result = encUtils.utf8ToNumber(input);
    expect(compare(result, expected)).toBeTruthy();
  });

  it('utf8ToBinary', async () => {
    const input = TEST_STRING_UTF8;
    const expected = TEST_STRING_BIN;
    const result = encUtils.utf8ToBinary(input);
    expect(compare(result, expected)).toBeTruthy();
  });

  // -- Number ----------------------------------------------- //

  it('numberToBuffer', async () => {
    const input = TEST_NUMBER_NUM;
    const expected = TEST_NUMBER_BUF;
    const result = encUtils.numberToBuffer(input);
    expect(compare(result, expected)).toBeTruthy();
  });

  it('numberToArray', async () => {
    const input = TEST_NUMBER_NUM;
    const expected = TEST_NUMBER_ARR;
    const result = encUtils.numberToArray(input);
    expect(compare(result, expected)).toBeTruthy();
  });

  it('numberToUtf8', async () => {
    const input = TEST_NUMBER_NUM;
    const expected = TEST_NUMBER_UTF8;
    const result = encUtils.numberToUtf8(input);
    expect(compare(result, expected)).toBeTruthy();
  });

  it('numberToHex', async () => {
    const input = TEST_NUMBER_NUM;
    const expected = TEST_NUMBER_HEX;
    const result = encUtils.numberToHex(input);
    expect(compare(result, expected)).toBeTruthy();
    expect(result.startsWith('0x')).toBeFalsy();
    expect(result.length % 2).toBeFalsy();
  });

  it('numberToBinary', async () => {
    const input = TEST_NUMBER_NUM;
    const expected = TEST_NUMBER_BIN;
    const result = encUtils.numberToBinary(input);
    expect(compare(result, expected)).toBeTruthy();
  });

  // -- Binary ----------------------------------------------- //

  it('binaryToBuffer', async () => {
    const input = TEST_STRING_BIN;
    const expected = TEST_STRING_BUF;
    const result = encUtils.binaryToBuffer(input);
    expect(compare(result, expected)).toBeTruthy();
  });

  it('binaryToArray', async () => {
    const input = TEST_STRING_BIN;
    const expected = TEST_STRING_ARR;
    const result = encUtils.binaryToArray(input);
    expect(compare(result, expected)).toBeTruthy();
  });

  it('binaryToHex', async () => {
    const input = TEST_STRING_BIN;
    const expected = TEST_STRING_HEX;
    const result = encUtils.binaryToHex(input);
    expect(compare(result, expected)).toBeTruthy();
    expect(result.startsWith('0x')).toBeFalsy();
    expect(result.length % 2).toBeFalsy();
  });

  it('binaryToUtf8', async () => {
    const input = TEST_STRING_BIN;
    const expected = TEST_STRING_UTF8;
    const result = encUtils.binaryToUtf8(input);
    expect(compare(result, expected)).toBeTruthy();
  });

  it('binaryToNumber', async () => {
    const input = TEST_NUMBER_BIN;
    const expected = TEST_NUMBER_NUM;
    const result = encUtils.binaryToNumber(input);
    expect(compare(result, expected)).toBeTruthy();
    expect(result).toEqual(parseInt(input, 2));
  });

  // -- Validators ----------------------------------------- //

  it('isBinaryString', async () => {
    expect(encUtils.isBinaryString(TEST_STRING_UTF8)).toBeFalsy();
    expect(encUtils.isBinaryString(TEST_STRING_HEX)).toBeFalsy();
    expect(encUtils.isBinaryString(TEST_INVALID_BIN)).toBeFalsy();
    expect(encUtils.isBinaryString(TEST_STRING_BIN)).toBeTruthy();
  });

  it('isHexString', async () => {
    expect(encUtils.isHexString(TEST_STRING_BIN)).toBeFalsy();
    expect(encUtils.isHexString(TEST_STRING_UTF8)).toBeFalsy();
    expect(
      encUtils.isHexString(encUtils.addHexPrefix(TEST_STRING_HEX))
    ).toBeTruthy();
  });

  it('isBuffer', async () => {
    expect(encUtils.isBuffer(TEST_STRING_ARR)).toBeFalsy();
    expect(encUtils.isBuffer(TEST_STRING_BUF)).toBeTruthy();
  });

  it('isTypedArray', async () => {
    expect(encUtils.isTypedArray(TEST_STRING_BUF)).toBeFalsy();
    expect(encUtils.isTypedArray(TEST_STRING_ARR)).toBeTruthy();
  });

  it('isArrayBuffer', async () => {
    expect(encUtils.isArrayBuffer(TEST_STRING_ARR)).toBeFalsy();
    expect(encUtils.isArrayBuffer(TEST_STRING_ARR.buffer)).toBeTruthy();
  });

  it('getType', async () => {
    expect(encUtils.getType([0, 1])).toEqual('array');
    expect(encUtils.getType(TEST_NUMBER_NUM)).toEqual('number');
    expect(encUtils.getType(TEST_NUMBER_HEX)).toEqual('string');
    expect(encUtils.getType(TEST_NUMBER_UTF8)).toEqual('string');
    expect(encUtils.getType(TEST_NUMBER_BUF)).toEqual('buffer');
    expect(encUtils.getType(TEST_NUMBER_ARR)).toEqual('typed-array');
    expect(encUtils.getType(TEST_NUMBER_ARR.buffer)).toEqual('array-buffer');
  });

  it('getEncoding', async () => {
    expect(encUtils.getEncoding(TEST_NUMBER_BIN)).toEqual('binary');
    expect(
      encUtils.getEncoding(encUtils.addHexPrefix(TEST_NUMBER_HEX))
    ).toEqual('hex');
    expect(encUtils.getEncoding(TEST_NUMBER_UTF8)).toEqual('utf8');
  });

  // -- Misc ----------------------------------------------- //

  it('concatBuffers', async () => {
    const input = [TEST_STRING_BUF, TEST_STRING_BUF];
    const expected = Buffer.concat(input);
    const result = encUtils.concatBuffers(...input);
    expect(compare(result, expected)).toBeTruthy();
  });

  it('concatArrays', async () => {
    const input = [TEST_STRING_ARR, TEST_STRING_ARR];
    const expected = new Uint8Array(
      Array.from(TEST_STRING_ARR).concat(Array.from(TEST_STRING_ARR))
    );
    const result = encUtils.concatArrays(...input);
    expect(compare(result, expected)).toBeTruthy();
  });

  it('trimLeft', async () => {
    const input = Buffer.concat([TEST_EMPTY_BUF, TEST_STRING_BUF]);
    const expected = TEST_STRING_BUF;
    const result = encUtils.trimLeft(input, TEST_EMPTY_BYTES);
    expect(compare(result, expected)).toBeTruthy();
    expect(result.length).toEqual(expected.length);
  });

  it('trimRight', async () => {
    const input = Buffer.concat([TEST_STRING_BUF, TEST_EMPTY_BUF]);
    const expected = TEST_STRING_BUF;
    const result = encUtils.trimRight(input, TEST_EMPTY_BYTES);
    expect(compare(result, expected)).toBeTruthy();
    expect(result.length).toEqual(expected.length);
  });

  it('calcByteLength', async () => {
    expect(encUtils.calcByteLength(0)).toEqual(0);
    expect(encUtils.calcByteLength(7)).toEqual(8);
    expect(encUtils.calcByteLength(8)).toEqual(8);
    expect(encUtils.calcByteLength(9)).toEqual(16);
    expect(encUtils.calcByteLength(15)).toEqual(16);
    expect(encUtils.calcByteLength(16)).toEqual(16);
    expect(encUtils.calcByteLength(17)).toEqual(24);
  });

  it('splitBytes', async () => {
    expect(encUtils.splitBytes(TEST_INVALID_BIN)).toEqual([TEST_SIMPLE_BIN]);
    expect(encUtils.splitBytes(TEST_SIMPLE_BIN)).toEqual([TEST_SIMPLE_BIN]);
    expect(encUtils.splitBytes(TEST_SIMPLE_BIN + TEST_SIMPLE_BIN)).toEqual([
      TEST_SIMPLE_BIN,
      TEST_SIMPLE_BIN,
    ]);
  });

  it('sanitizeBytes', async () => {
    expect(encUtils.sanitizeBytes('001')).toEqual('00000001');
    expect(encUtils.sanitizeBytes('001', 2)).toEqual('0001');
    expect(encUtils.sanitizeBytes('1', 2, '1')).toEqual('11');
  });

  it('swapBytes', async () => {
    expect(encUtils.swapBytes(TEST_SIMPLE_BIN)).toEqual(TEST_SWAPPED_BIN);
  });
  it('swapHex', async () => {
    expect(encUtils.swapHex(TEST_STRING_HEX)).toEqual(TEST_SWAPPED_HEX);
  });

  it('padLeft', async () => {
    const input = TEST_STRING_HEX;
    const expected = TEST_EMPTY_HEX + TEST_STRING_HEX;
    const result = encUtils.padLeft(input, expected.length);
    expect(compare(result, expected)).toBeTruthy();
    expect(result.length).toEqual(expected.length);
    expect(result.replace(input, '')).toEqual(
      '0'.repeat(expected.length - input.length)
    );
  });

  it('padRight', async () => {
    const input = TEST_STRING_HEX;
    const expected = TEST_STRING_HEX + TEST_EMPTY_HEX;
    const result = encUtils.padRight(input, expected.length);
    expect(compare(result, expected)).toBeTruthy();
    expect(result.length).toEqual(expected.length);
    expect(result.replace(input, '')).toEqual(
      '0'.repeat(expected.length - input.length)
    );
  });

  it('removeHexPrefix', async () => {
    expect(encUtils.removeHexPrefix(TEST_STRING_HEX)).toEqual(TEST_STRING_HEX);
    expect(encUtils.removeHexPrefix('0x' + TEST_STRING_HEX)).toEqual(
      TEST_STRING_HEX
    );
  });

  it('addHexPrefix', async () => {
    expect(encUtils.addHexPrefix(TEST_STRING_HEX)).toEqual(
      '0x' + TEST_STRING_HEX
    );
    expect(encUtils.addHexPrefix('0x' + TEST_STRING_HEX)).toEqual(
      '0x' + TEST_STRING_HEX
    );
  });

  it('sanitizeHex', async () => {
    expect(encUtils.sanitizeHex('0x' + TEST_STRING_HEX)).toEqual(
      '0x' + TEST_STRING_HEX
    );
    expect(encUtils.sanitizeHex(TEST_STRING_HEX)).toEqual(
      '0x' + TEST_STRING_HEX
    );
    expect(encUtils.sanitizeHex('0x0' + TEST_STRING_HEX)).toEqual(
      '0x00' + TEST_STRING_HEX
    );
  });

  it('removeHexLeadingZeros', async () => {
    expect(encUtils.removeHexLeadingZeros(TEST_STRING_HEX)).toEqual(
      TEST_STRING_HEX
    );
    expect(encUtils.removeHexLeadingZeros('0' + TEST_STRING_HEX)).toEqual(
      TEST_STRING_HEX
    );
  });
});
