import "mocha";
import * as chai from "chai";

import {
  isServerErrorCode,
  isReservedErrorCode,
  isValidErrorCode,
  PARSE_ERROR,
  getError,
  INVALID_REQUEST,
  METHOD_NOT_FOUND,
  INVALID_PARAMS,
  INTERNAL_ERROR,
  SERVER_ERROR,
} from "../src";

describe("Error", () => {
  it("isServerErrorCode", () => {
    chai.expect(isServerErrorCode(2000)).to.be.false;
    chai.expect(isServerErrorCode(-32000)).to.be.true;
  });
  it("isReservedErrorCode", () => {
    chai.expect(isReservedErrorCode(-32000)).to.be.false;
    chai.expect(isReservedErrorCode(-32700)).to.be.true;
  });
  it("isValidErrorCode", () => {
    chai.expect(isValidErrorCode("1000" as any)).to.be.false;
    chai.expect(isValidErrorCode(1000)).to.be.true;
  });
  it("getError", () => {
    chai.expect(getError(PARSE_ERROR)).to.eql({
      code: -32700,
      message: "Parse error",
    });
    chai.expect(getError(INVALID_REQUEST)).to.eql({
      code: -32600,
      message: "Invalid Request",
    });
    chai.expect(getError(METHOD_NOT_FOUND)).to.eql({
      code: -32601,
      message: "Method not found",
    });
    chai.expect(getError(INVALID_PARAMS)).to.eql({
      code: -32602,
      message: "Invalid params",
    });
    chai.expect(getError(INTERNAL_ERROR)).to.eql({
      code: -32603,
      message: "Internal error",
    });
    chai.expect(getError(SERVER_ERROR)).to.eql({
      code: -32000,
      message: "Server error",
    });
  });
});
