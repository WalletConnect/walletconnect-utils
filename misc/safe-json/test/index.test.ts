import "mocha";
import * as chai from "chai";

import { safeJsonParse, safeJsonStringify } from "../src";

const json = { something: true };
const valid = JSON.stringify(json);
const invalid = "{something:true}";
const str = "hello world";
const missing = { something: true, missing: undefined };

describe("@walletconnect/safe-json", () => {
  describe("safeJsonParse", () => {
    it("should throw when value is not a string", () => {
      chai
        .expect(() => safeJsonParse(json as any))
        .to.throw("Cannot safe json parse value of type object");
    });
    it("should return an object when valid json", () => {
      const result = safeJsonParse(valid);
      chai.expect(result).to.eql(json);
    });
    it("should return the same input when invalid json", () => {
      const result = safeJsonParse(invalid);
      chai.expect(result).to.eql(invalid);
    });
    it("should handle bigint", () => {
      const result = safeJsonParse(safeJsonStringify({ bigint: BigInt(1) }));
      chai.expect(result).to.deep.eq({ bigint: BigInt(1) });
    });
  });
  describe("safeJsonStringify", () => {
    it("should return a stringfied json", () => {
      const result = safeJsonStringify(json);
      chai.expect(result).to.eql(valid);
    });
    it("should ignored undefined values", () => {
      const result = safeJsonStringify(missing);
      chai.expect(result).to.eql(valid);
    });
    it("should return input when already a string", () => {
      const result = safeJsonStringify(str);
      chai.expect(result).to.eql(str);
    });
  });
});
