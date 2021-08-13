import "mocha";
import * as chai from "chai";

import * as encoding from "../src/";

function compare(a: any, b: any) {
  const type = encoding.getType(a);
  if (type !== encoding.getType(b)) {
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
    const result = encoding.bufferToArray(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("bufferToHex", async () => {
    const input = TEST_STRING_BUF;
    const expected = TEST_STRING_HEX;
    const result = encoding.bufferToHex(input);
    chai.expect(compare(result, expected)).to.be.true;
    chai.expect(result.startsWith("0x")).to.be.false;
    chai.expect(result.length % 2).to.eql(0);
  });

  it("bufferToUtf8", async () => {
    const input = TEST_STRING_BUF;
    const expected = TEST_STRING_UTF8;
    const result = encoding.bufferToUtf8(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("bufferToNumber", async () => {
    const input = TEST_NUMBER_BUF;
    const expected = TEST_NUMBER_NUM;
    const result = encoding.bufferToNumber(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("bufferToBinary", async () => {
    const input = TEST_STRING_BUF;
    const expected = TEST_STRING_BIN;
    const result = encoding.bufferToBinary(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  // -- Uint8Array -------------------------------------------- //

  it("arrayToBuffer", async () => {
    const input = TEST_STRING_ARR;
    const expected = TEST_STRING_BUF;
    const result = encoding.arrayToBuffer(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("arrayToHex", async () => {
    const input = TEST_STRING_ARR;
    const expected = TEST_STRING_HEX;
    const result = encoding.arrayToHex(input);
    chai.expect(compare(result, expected)).to.be.true;
    chai.expect(result.startsWith("0x")).to.be.false;
    chai.expect(result.length % 2).to.eql(0);
  });

  it("arrayToUtf8", async () => {
    const input = TEST_STRING_ARR;
    const expected = TEST_STRING_UTF8;
    const result = encoding.arrayToUtf8(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("arrayToNumber", async () => {
    const input = TEST_NUMBER_ARR;
    const expected = TEST_NUMBER_NUM;
    const result = encoding.arrayToNumber(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("arrayToBinary", async () => {
    const input = TEST_STRING_ARR;
    const expected = TEST_STRING_BIN;
    const result = encoding.arrayToBinary(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  // -- Hex -------------------------------------------------- //

  it("hexToBuffer", async () => {
    const input = TEST_STRING_HEX;
    const expected = TEST_STRING_BUF;
    const result = encoding.hexToBuffer(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("hexToArray", async () => {
    const input = TEST_NUMBER_HEX;
    const expected = TEST_NUMBER_ARR;
    const result = encoding.hexToArray(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("hexToUtf8", async () => {
    const input = TEST_STRING_HEX;
    const expected = TEST_STRING_UTF8;
    const result = encoding.hexToUtf8(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("hexToNumber", async () => {
    const input = TEST_NUMBER_HEX;
    const expected = TEST_NUMBER_NUM;
    const result = encoding.hexToNumber(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("hexToBinary", async () => {
    const input = TEST_STRING_HEX;
    const expected = TEST_STRING_BIN;
    const result = encoding.hexToBinary(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  // -- Utf8 ------------------------------------------------- //

  it("utf8ToBuffer", async () => {
    const input = TEST_STRING_UTF8;
    const expected = TEST_STRING_BUF;
    const result = encoding.utf8ToBuffer(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("utf8ToArray", async () => {
    const input = TEST_STRING_UTF8;
    const expected = TEST_STRING_ARR;
    const result = encoding.utf8ToArray(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("utf8ToHex", async () => {
    const input = TEST_STRING_UTF8;
    const expected = TEST_STRING_HEX;
    const result = encoding.utf8ToHex(input);
    chai.expect(compare(result, expected)).to.be.true;
    chai.expect(result.startsWith("0x")).to.be.false;
    chai.expect(result.length % 2).to.eql(0);
  });

  it("utf8ToNumber", async () => {
    const input = TEST_NUMBER_UTF8;
    const expected = TEST_NUMBER_NUM;
    const result = encoding.utf8ToNumber(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("utf8ToBinary", async () => {
    const input = TEST_STRING_UTF8;
    const expected = TEST_STRING_BIN;
    const result = encoding.utf8ToBinary(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  // -- Number ----------------------------------------------- //

  it("numberToBuffer", async () => {
    const input = TEST_NUMBER_NUM;
    const expected = TEST_NUMBER_BUF;
    const result = encoding.numberToBuffer(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("numberToArray", async () => {
    const input = TEST_NUMBER_NUM;
    const expected = TEST_NUMBER_ARR;
    const result = encoding.numberToArray(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("numberToUtf8", async () => {
    const input = TEST_NUMBER_NUM;
    const expected = TEST_NUMBER_UTF8;
    const result = encoding.numberToUtf8(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("numberToHex", async () => {
    const input = TEST_NUMBER_NUM;
    const expected = TEST_NUMBER_HEX;
    const result = encoding.numberToHex(input);
    chai.expect(compare(result, expected)).to.be.true;
    chai.expect(result.startsWith("0x")).to.be.false;
    chai.expect(result.length % 2).to.eql(0);
  });

  it("numberToBinary", async () => {
    const input = TEST_NUMBER_NUM;
    const expected = TEST_NUMBER_BIN;
    const result = encoding.numberToBinary(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  // -- Binary ----------------------------------------------- //

  it("binaryToBuffer", async () => {
    const input = TEST_STRING_BIN;
    const expected = TEST_STRING_BUF;
    const result = encoding.binaryToBuffer(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("binaryToArray", async () => {
    const input = TEST_STRING_BIN;
    const expected = TEST_STRING_ARR;
    const result = encoding.binaryToArray(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("binaryToHex", async () => {
    const input = TEST_STRING_BIN;
    const expected = TEST_STRING_HEX;
    const result = encoding.binaryToHex(input);
    chai.expect(compare(result, expected)).to.be.true;
    chai.expect(result.startsWith("0x")).to.be.false;
    chai.expect(result.length % 2).to.eql(0);
  });

  it("binaryToUtf8", async () => {
    const input = TEST_STRING_BIN;
    const expected = TEST_STRING_UTF8;
    const result = encoding.binaryToUtf8(input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("binaryToNumber", async () => {
    const input = TEST_NUMBER_BIN;
    const expected = TEST_NUMBER_NUM;
    const result = encoding.binaryToNumber(input);
    chai.expect(compare(result, expected)).to.be.true;
    chai.expect(result).to.eql(parseInt(input, 2));
  });

  // -- Validators ----------------------------------------- //

  it("isBinaryString", async () => {
    chai.expect(encoding.isBinaryString(TEST_STRING_UTF8)).to.be.false;
    chai.expect(encoding.isBinaryString(TEST_STRING_HEX)).to.be.false;
    chai.expect(encoding.isBinaryString(TEST_INVALID_BIN)).to.be.false;
    chai.expect(encoding.isBinaryString(TEST_STRING_BIN)).to.be.true;
  });

  it("isHexString", async () => {
    chai.expect(encoding.isHexString(TEST_STRING_BIN)).to.be.false;
    chai.expect(encoding.isHexString(TEST_STRING_UTF8)).to.be.false;
    chai.expect(encoding.isHexString(encoding.addHexPrefix(TEST_STRING_HEX))).to
      .be.true;
  });

  it("isBuffer", async () => {
    chai.expect(encoding.isBuffer(TEST_STRING_ARR)).to.be.false;
    chai.expect(encoding.isBuffer(TEST_STRING_BUF)).to.be.true;
  });

  it("isTypedArray", async () => {
    chai.expect(encoding.isTypedArray(TEST_STRING_BUF)).to.be.false;
    chai.expect(encoding.isTypedArray(TEST_STRING_ARR)).to.be.true;
  });

  it("isArrayBuffer", async () => {
    chai.expect(encoding.isArrayBuffer(TEST_STRING_ARR)).to.be.false;
    chai.expect(encoding.isArrayBuffer(TEST_STRING_ARR.buffer)).to.be.true;
  });

  it("getType", async () => {
    chai.expect(encoding.getType([0, 1])).to.eql("array");
    chai.expect(encoding.getType(TEST_NUMBER_NUM)).to.eql("number");
    chai.expect(encoding.getType(TEST_NUMBER_HEX)).to.eql("string");
    chai.expect(encoding.getType(TEST_NUMBER_UTF8)).to.eql("string");
    chai.expect(encoding.getType(TEST_NUMBER_BUF)).to.eql("buffer");
    chai.expect(encoding.getType(TEST_NUMBER_ARR)).to.eql("typed-array");
    chai
      .expect(encoding.getType(TEST_NUMBER_ARR.buffer))
      .to.eql("array-buffer");
  });

  it("getEncoding", async () => {
    chai.expect(encoding.getEncoding(TEST_NUMBER_BIN)).to.eql("binary");
    chai
      .expect(encoding.getEncoding(encoding.addHexPrefix(TEST_NUMBER_HEX)))
      .to.eql("hex");
    chai.expect(encoding.getEncoding(TEST_NUMBER_UTF8)).to.eql("utf8");
  });

  // -- Misc ----------------------------------------------- //

  it("concatBuffers", async () => {
    const input = [TEST_STRING_BUF, TEST_STRING_BUF];
    const expected = Buffer.concat(input);
    const result = encoding.concatBuffers(...input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("concatArrays", async () => {
    const input = [TEST_STRING_ARR, TEST_STRING_ARR];
    const expected = new Uint8Array(
      Array.from(TEST_STRING_ARR).concat(Array.from(TEST_STRING_ARR))
    );
    const result = encoding.concatArrays(...input);
    chai.expect(compare(result, expected)).to.be.true;
  });

  it("trimLeft", async () => {
    const input = Buffer.concat([TEST_EMPTY_BUF, TEST_STRING_BUF]);
    const expected = TEST_STRING_BUF;
    const result = encoding.trimLeft(input, TEST_EMPTY_BYTES);
    chai.expect(compare(result, expected)).to.be.true;
    chai.expect(result.length).to.eql(expected.length);
  });

  it("trimRight", async () => {
    const input = Buffer.concat([TEST_STRING_BUF, TEST_EMPTY_BUF]);
    const expected = TEST_STRING_BUF;
    const result = encoding.trimRight(input, TEST_EMPTY_BYTES);
    chai.expect(compare(result, expected)).to.be.true;
    chai.expect(result.length).to.eql(expected.length);
  });

  it("calcByteLength", async () => {
    chai.expect(encoding.calcByteLength(0)).to.eql(0);
    chai.expect(encoding.calcByteLength(7)).to.eql(8);
    chai.expect(encoding.calcByteLength(8)).to.eql(8);
    chai.expect(encoding.calcByteLength(9)).to.eql(16);
    chai.expect(encoding.calcByteLength(15)).to.eql(16);
    chai.expect(encoding.calcByteLength(16)).to.eql(16);
    chai.expect(encoding.calcByteLength(17)).to.eql(24);
  });

  it("splitBytes", async () => {
    chai
      .expect(encoding.splitBytes(TEST_INVALID_BIN))
      .to.eql([TEST_SIMPLE_BIN]);
    chai.expect(encoding.splitBytes(TEST_SIMPLE_BIN)).to.eql([TEST_SIMPLE_BIN]);
    chai
      .expect(encoding.splitBytes(TEST_SIMPLE_BIN + TEST_SIMPLE_BIN))
      .to.eql([TEST_SIMPLE_BIN, TEST_SIMPLE_BIN]);
  });

  it("sanitizeBytes", async () => {
    chai.expect(encoding.sanitizeBytes("001")).to.eql("00000001");
    chai.expect(encoding.sanitizeBytes("001", 2)).to.eql("0001");
    chai.expect(encoding.sanitizeBytes("1", 2, "1")).to.eql("11");
  });

  it("swapBytes", async () => {
    chai.expect(encoding.swapBytes(TEST_SIMPLE_BIN)).to.eql(TEST_SWAPPED_BIN);
  });
  it("swapHex", async () => {
    chai.expect(encoding.swapHex(TEST_STRING_HEX)).to.eql(TEST_SWAPPED_HEX);
  });

  it("padLeft", async () => {
    const input = TEST_STRING_HEX;
    const expected = TEST_EMPTY_HEX + TEST_STRING_HEX;
    const result = encoding.padLeft(input, expected.length);
    chai.expect(compare(result, expected)).to.be.true;
    chai.expect(result.length).to.eql(expected.length);
    chai
      .expect(result.replace(input, ""))
      .to.eql("0".repeat(expected.length - input.length));
  });

  it("padRight", async () => {
    const input = TEST_STRING_HEX;
    const expected = TEST_STRING_HEX + TEST_EMPTY_HEX;
    const result = encoding.padRight(input, expected.length);
    chai.expect(compare(result, expected)).to.be.true;
    chai.expect(result.length).to.eql(expected.length);
    chai
      .expect(result.replace(input, ""))
      .to.eql("0".repeat(expected.length - input.length));
  });

  it("removeHexPrefix", async () => {
    chai
      .expect(encoding.removeHexPrefix(TEST_STRING_HEX))
      .to.eql(TEST_STRING_HEX);
    chai
      .expect(encoding.removeHexPrefix("0x" + TEST_STRING_HEX))
      .to.eql(TEST_STRING_HEX);
  });

  it("addHexPrefix", async () => {
    chai
      .expect(encoding.addHexPrefix(TEST_STRING_HEX))
      .to.eql("0x" + TEST_STRING_HEX);
    chai
      .expect(encoding.addHexPrefix("0x" + TEST_STRING_HEX))
      .to.eql("0x" + TEST_STRING_HEX);
  });

  it("sanitizeHex", async () => {
    chai
      .expect(encoding.sanitizeHex("0x" + TEST_STRING_HEX))
      .to.eql("0x" + TEST_STRING_HEX);
    chai
      .expect(encoding.sanitizeHex(TEST_STRING_HEX))
      .to.eql("0x" + TEST_STRING_HEX);
    chai
      .expect(encoding.sanitizeHex("0x0" + TEST_STRING_HEX))
      .to.eql("0x00" + TEST_STRING_HEX);
  });

  it("removeHexLeadingZeros", async () => {
    chai
      .expect(encoding.removeHexLeadingZeros(TEST_STRING_HEX))
      .to.eql(TEST_STRING_HEX);
    chai
      .expect(encoding.removeHexLeadingZeros("0" + TEST_STRING_HEX))
      .to.eql(TEST_STRING_HEX);
  });
});
