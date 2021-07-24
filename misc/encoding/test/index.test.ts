import "mocha";
import * as chai from "chai";

import * as encUtils from "../src/";

function compare(a: any, b: any) {
  const type = encUtils.getType(a);
  if (type !== encUtils.getType(b)) {
    return false;
  }
  if (type === "array-buffer") {
    a = Buffer.from(a);
    b = Buffer.from(b);
  }
  return a.toString().toLowerCase() === b.toString().toLowerCase();
}

const TEST_STRING_UTF8 = "encoding";
const TEST_STRING_HEX = "656e636f64696e67";
const TEST_STRING_BUF = Buffer.from(TEST_STRING_HEX, "hex");
const TEST_STRING_ARR = new Uint8Array(TEST_STRING_BUF);
const TEST_STRING_BIN =
  "0110010101101110011000110110111101100100011010010110111001100111";

const TEST_NUMBER_NUM = 16;
const TEST_NUMBER_HEX = "10";
const TEST_NUMBER_UTF8 = `${TEST_NUMBER_NUM}`;
const TEST_NUMBER_BUF = Buffer.from(TEST_NUMBER_HEX, "hex");
const TEST_NUMBER_ARR = new Uint8Array(TEST_NUMBER_BUF);
const TEST_NUMBER_BIN = "00010000";

const TEST_EMPTY_BYTES = 8;
const TEST_EMPTY_HEX = "0".repeat(TEST_EMPTY_BYTES * 2);
const TEST_EMPTY_BUF = Buffer.from(TEST_EMPTY_HEX, "hex");

const TEST_SIMPLE_BIN = "01010101";
const TEST_INVALID_BIN = TEST_SIMPLE_BIN.slice(1);
const TEST_SWAPPED_BIN = "10101010";
const TEST_SWAPPED_HEX = "a676c6f6269676e6";

describe("EncUtils", () => {
  // -- Buffer ----------------------------------------------- //

  it("bufferToArray", async () => {
    const input = TEST_STRING_BUF;
    const expected = TEST_STRING_ARR;
    const result = encUtils.bufferToArray(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("bufferToHex", async () => {
    const input = TEST_STRING_BUF;
    const expected = TEST_STRING_HEX;
    const result = encUtils.bufferToHex(input);
    chai.expect(compare(result, expected)).to.be.true;
    chai.expect(result.startsWith("0x")).to.be.false;
    chai.expect(result.length % 2).to.eql(0);
  });

  it("bufferToUtf8", async () => {
    const input = TEST_STRING_BUF;
    const expected = TEST_STRING_UTF8;
    const result = encUtils.bufferToUtf8(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("bufferToNumber", async () => {
    const input = TEST_NUMBER_BUF;
    const expected = TEST_NUMBER_NUM;
    const result = encUtils.bufferToNumber(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("bufferToBinary", async () => {
    const input = TEST_STRING_BUF;
    const expected = TEST_STRING_BIN;
    const result = encUtils.bufferToBinary(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  // -- Uint8Array -------------------------------------------- //

  it("arrayToBuffer", async () => {
    const input = TEST_STRING_ARR;
    const expected = TEST_STRING_BUF;
    const result = encUtils.arrayToBuffer(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("arrayToHex", async () => {
    const input = TEST_STRING_ARR;
    const expected = TEST_STRING_HEX;
    const result = encUtils.arrayToHex(input);
    chai.expect(compare(result, expected)).to.be.true;
    chai.expect(result.startsWith("0x")).to.be.false;
    chai.expect(result.length % 2).to.eql(0);
  });

  it("arrayToUtf8", async () => {
    const input = TEST_STRING_ARR;
    const expected = TEST_STRING_UTF8;
    const result = encUtils.arrayToUtf8(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("arrayToNumber", async () => {
    const input = TEST_NUMBER_ARR;
    const expected = TEST_NUMBER_NUM;
    const result = encUtils.arrayToNumber(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("arrayToBinary", async () => {
    const input = TEST_STRING_ARR;
    const expected = TEST_STRING_BIN;
    const result = encUtils.arrayToBinary(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  // -- Hex -------------------------------------------------- //

  it("hexToBuffer", async () => {
    const input = TEST_STRING_HEX;
    const expected = TEST_STRING_BUF;
    const result = encUtils.hexToBuffer(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("hexToArray", async () => {
    const input = TEST_NUMBER_HEX;
    const expected = TEST_NUMBER_ARR;
    const result = encUtils.hexToArray(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("hexToUtf8", async () => {
    const input = TEST_STRING_HEX;
    const expected = TEST_STRING_UTF8;
    const result = encUtils.hexToUtf8(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("hexToNumber", async () => {
    const input = TEST_NUMBER_HEX;
    const expected = TEST_NUMBER_NUM;
    const result = encUtils.hexToNumber(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("hexToBinary", async () => {
    const input = TEST_STRING_HEX;
    const expected = TEST_STRING_BIN;
    const result = encUtils.hexToBinary(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  // -- Utf8 ------------------------------------------------- //

  it("utf8ToBuffer", async () => {
    const input = TEST_STRING_UTF8;
    const expected = TEST_STRING_BUF;
    const result = encUtils.utf8ToBuffer(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("utf8ToArray", async () => {
    const input = TEST_STRING_UTF8;
    const expected = TEST_STRING_ARR;
    const result = encUtils.utf8ToArray(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("utf8ToHex", async () => {
    const input = TEST_STRING_UTF8;
    const expected = TEST_STRING_HEX;
    const result = encUtils.utf8ToHex(input);
    chai.expect(compare(result, expected)).to.be.true;
    chai.expect(result.startsWith("0x")).to.be.false;
    chai.expect(result.length % 2).to.eql(0);
  });

  it("utf8ToNumber", async () => {
    const input = TEST_NUMBER_UTF8;
    const expected = TEST_NUMBER_NUM;
    const result = encUtils.utf8ToNumber(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("utf8ToBinary", async () => {
    const input = TEST_STRING_UTF8;
    const expected = TEST_STRING_BIN;
    const result = encUtils.utf8ToBinary(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  // -- Number ----------------------------------------------- //

  it("numberToBuffer", async () => {
    const input = TEST_NUMBER_NUM;
    const expected = TEST_NUMBER_BUF;
    const result = encUtils.numberToBuffer(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("numberToArray", async () => {
    const input = TEST_NUMBER_NUM;
    const expected = TEST_NUMBER_ARR;
    const result = encUtils.numberToArray(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("numberToUtf8", async () => {
    const input = TEST_NUMBER_NUM;
    const expected = TEST_NUMBER_UTF8;
    const result = encUtils.numberToUtf8(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("numberToHex", async () => {
    const input = TEST_NUMBER_NUM;
    const expected = TEST_NUMBER_HEX;
    const result = encUtils.numberToHex(input);
    chai.expect(compare(result, expected)).to.be.true;
    chai.expect(result.startsWith("0x")).to.be.false;
    chai.expect(result.length % 2).to.eql(0);
  });

  it("numberToBinary", async () => {
    const input = TEST_NUMBER_NUM;
    const expected = TEST_NUMBER_BIN;
    const result = encUtils.numberToBinary(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  // -- Binary ----------------------------------------------- //

  it("binaryToBuffer", async () => {
    const input = TEST_STRING_BIN;
    const expected = TEST_STRING_BUF;
    const result = encUtils.binaryToBuffer(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("binaryToArray", async () => {
    const input = TEST_STRING_BIN;
    const expected = TEST_STRING_ARR;
    const result = encUtils.binaryToArray(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("binaryToHex", async () => {
    const input = TEST_STRING_BIN;
    const expected = TEST_STRING_HEX;
    const result = encUtils.binaryToHex(input);
    chai.expect(compare(result, expected)).to.be.true;
    chai.expect(result.startsWith("0x")).to.be.false;
    chai.expect(result.length % 2).to.eql(0);
  });

  it("binaryToUtf8", async () => {
    const input = TEST_STRING_BIN;
    const expected = TEST_STRING_UTF8;
    const result = encUtils.binaryToUtf8(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("binaryToNumber", async () => {
    const input = TEST_NUMBER_BIN;
    const expected = TEST_NUMBER_NUM;
    const result = encUtils.binaryToNumber(input);
    chai.expect(compare(result, expected)).to.be.true;
    chai.expect(result).to.eql(parseInt(input, 2));
  });

  // -- Validators ----------------------------------------- //

  it("isBinaryString", async () => {
    chai.expect(encUtils.isBinaryString(TEST_STRING_UTF8)).to.be.false;
    chai.expect(encUtils.isBinaryString(TEST_STRING_HEX)).to.be.false;
    chai.expect(encUtils.isBinaryString(TEST_INVALID_BIN)).to.be.false;
    chai.expect(encUtils.isBinaryString(TEST_STRING_BIN)).to.be.true;
  });

  it("isHexString", async () => {
    chai.expect(encUtils.isHexString(TEST_STRING_BIN)).to.be.false;
    chai.expect(encUtils.isHexString(TEST_STRING_UTF8)).to.be.false;
    chai.expect(encUtils.isHexString(encUtils.addHexPrefix(TEST_STRING_HEX))).to
      .be.true;
  });

  it("isBuffer", async () => {
    chai.expect(encUtils.isBuffer(TEST_STRING_ARR)).to.be.false;
    chai.expect(encUtils.isBuffer(TEST_STRING_BUF)).to.be.true;
  });

  it("isTypedArray", async () => {
    chai.expect(encUtils.isTypedArray(TEST_STRING_BUF)).to.be.false;
    chai.expect(encUtils.isTypedArray(TEST_STRING_ARR)).to.be.true;
  });

  it("isArrayBuffer", async () => {
    chai.expect(encUtils.isArrayBuffer(TEST_STRING_ARR)).to.be.false;
    chai.expect(encUtils.isArrayBuffer(TEST_STRING_ARR.buffer)).to.be.true;
  });

  it("getType", async () => {
    chai.expect(encUtils.getType([0, 1])).to.eql("array");
    chai.expect(encUtils.getType(TEST_NUMBER_NUM)).to.eql("number");
    chai.expect(encUtils.getType(TEST_NUMBER_HEX)).to.eql("string");
    chai.expect(encUtils.getType(TEST_NUMBER_UTF8)).to.eql("string");
    chai.expect(encUtils.getType(TEST_NUMBER_BUF)).to.eql("buffer");
    chai.expect(encUtils.getType(TEST_NUMBER_ARR)).to.eql("typed-array");
    chai
      .expect(encUtils.getType(TEST_NUMBER_ARR.buffer))
      .to.eql("array-buffer");
  });

  it("getEncoding", async () => {
    chai.expect(encUtils.getEncoding(TEST_NUMBER_BIN)).to.eql("binary");
    chai
      .expect(encUtils.getEncoding(encUtils.addHexPrefix(TEST_NUMBER_HEX)))
      .to.eql("hex");
    chai.expect(encUtils.getEncoding(TEST_NUMBER_UTF8)).to.eql("utf8");
  });

  // -- Misc ----------------------------------------------- //

  it("concatBuffers", async () => {
    const input = [TEST_STRING_BUF, TEST_STRING_BUF];
    const expected = Buffer.concat(input);
    const result = encUtils.concatBuffers(...input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("concatArrays", async () => {
    const input = [TEST_STRING_ARR, TEST_STRING_ARR];
    const expected = new Uint8Array(
      Array.from(TEST_STRING_ARR).concat(Array.from(TEST_STRING_ARR))
    );
    const result = encUtils.concatArrays(...input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("trimLeft", async () => {
    const input = Buffer.concat([TEST_EMPTY_BUF, TEST_STRING_BUF]);
    const expected = TEST_STRING_BUF;
    const result = encUtils.trimLeft(input, TEST_EMPTY_BYTES);
    chai.expect(compare(result, expected)).to.be.true;
    chai.expect(result.length).to.eql(expected.length);
  });

  it("trimRight", async () => {
    const input = Buffer.concat([TEST_STRING_BUF, TEST_EMPTY_BUF]);
    const expected = TEST_STRING_BUF;
    const result = encUtils.trimRight(input, TEST_EMPTY_BYTES);
    chai.expect(compare(result, expected)).to.be.true;
    chai.expect(result.length).to.eql(expected.length);
  });

  it("calcByteLength", async () => {
    chai.expect(encUtils.calcByteLength(0)).to.eql(0);
    chai.expect(encUtils.calcByteLength(7)).to.eql(8);
    chai.expect(encUtils.calcByteLength(8)).to.eql(8);
    chai.expect(encUtils.calcByteLength(9)).to.eql(16);
    chai.expect(encUtils.calcByteLength(15)).to.eql(16);
    chai.expect(encUtils.calcByteLength(16)).to.eql(16);
    chai.expect(encUtils.calcByteLength(17)).to.eql(24);
  });

  it("splitBytes", async () => {
    chai
      .expect(encUtils.splitBytes(TEST_INVALID_BIN))
      .to.eql([TEST_SIMPLE_BIN]);
    chai.expect(encUtils.splitBytes(TEST_SIMPLE_BIN)).to.eql([TEST_SIMPLE_BIN]);
    chai
      .expect(encUtils.splitBytes(TEST_SIMPLE_BIN + TEST_SIMPLE_BIN))
      .to.eql([TEST_SIMPLE_BIN, TEST_SIMPLE_BIN]);
  });

  it("sanitizeBytes", async () => {
    chai.expect(encUtils.sanitizeBytes("001")).to.eql("00000001");
    chai.expect(encUtils.sanitizeBytes("001", 2)).to.eql("0001");
    chai.expect(encUtils.sanitizeBytes("1", 2, "1")).to.eql("11");
  });

  it("swapBytes", async () => {
    chai.expect(encUtils.swapBytes(TEST_SIMPLE_BIN)).to.eql(TEST_SWAPPED_BIN);
  });
  it("swapHex", async () => {
    chai.expect(encUtils.swapHex(TEST_STRING_HEX)).to.eql(TEST_SWAPPED_HEX);
  });

  it("padLeft", async () => {
    const input = TEST_STRING_HEX;
    const expected = TEST_EMPTY_HEX + TEST_STRING_HEX;
    const result = encUtils.padLeft(input, expected.length);
    chai.expect(compare(result, expected)).to.be.true;
    chai.expect(result.length).to.eql(expected.length);
    chai
      .expect(result.replace(input, ""))
      .to.eql("0".repeat(expected.length - input.length));
  });

  it("padRight", async () => {
    const input = TEST_STRING_HEX;
    const expected = TEST_STRING_HEX + TEST_EMPTY_HEX;
    const result = encUtils.padRight(input, expected.length);
    chai.expect(compare(result, expected)).to.be.true;
    chai.expect(result.length).to.eql(expected.length);
    chai
      .expect(result.replace(input, ""))
      .to.eql("0".repeat(expected.length - input.length));
  });

  it("removeHexPrefix", async () => {
    chai
      .expect(encUtils.removeHexPrefix(TEST_STRING_HEX))
      .to.eql(TEST_STRING_HEX);
    chai
      .expect(encUtils.removeHexPrefix("0x" + TEST_STRING_HEX))
      .to.eql(TEST_STRING_HEX);
  });

  it("addHexPrefix", async () => {
    chai
      .expect(encUtils.addHexPrefix(TEST_STRING_HEX))
      .to.eql("0x" + TEST_STRING_HEX);
    chai
      .expect(encUtils.addHexPrefix("0x" + TEST_STRING_HEX))
      .to.eql("0x" + TEST_STRING_HEX);
  });

  it("sanitizeHex", async () => {
    chai
      .expect(encUtils.sanitizeHex("0x" + TEST_STRING_HEX))
      .to.eql("0x" + TEST_STRING_HEX);
    chai
      .expect(encUtils.sanitizeHex(TEST_STRING_HEX))
      .to.eql("0x" + TEST_STRING_HEX);
    chai
      .expect(encUtils.sanitizeHex("0x0" + TEST_STRING_HEX))
      .to.eql("0x00" + TEST_STRING_HEX);
  });

  it("removeHexLeadingZeros", async () => {
    chai
      .expect(encUtils.removeHexLeadingZeros(TEST_STRING_HEX))
      .to.eql(TEST_STRING_HEX);
    chai
      .expect(encUtils.removeHexLeadingZeros("0" + TEST_STRING_HEX))
      .to.eql(TEST_STRING_HEX);
  });
});
