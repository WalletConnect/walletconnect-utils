import "mocha";
import * as chai from "chai";
import isEqual from "lodash.isequal";

import {
  formatJsonRpcRequest,
  formatJsonRpcResult,
  formatJsonRpcError,
  formatErrorMessage,
} from "../src";
import {
  TEST_ERROR,
  TEST_ERROR_MESSAGE,
  TEST_ID,
  TEST_JSONRPC_ERROR,
  TEST_JSONRPC_REQUEST,
  TEST_JSONRPC_RESULT,
  TEST_METHOD,
  TEST_PARAMS,
  TEST_RESULT,
} from "./shared";

describe("Formatters", () => {
  it("formatJsonRpcRequest", () => {
    const result = formatJsonRpcRequest(TEST_METHOD, TEST_PARAMS, TEST_ID);
    const expected = TEST_JSONRPC_REQUEST;
    chai.expect(isEqual(result, expected)).to.be.true;
  });

  it("formatJsonRpcResult", () => {
    const result = formatJsonRpcResult(TEST_ID, TEST_RESULT);
    const expected = TEST_JSONRPC_RESULT;
    chai.expect(isEqual(result, expected)).to.be.true;
  });

  it("formatJsonRpcError", () => {
    const result = formatJsonRpcError(TEST_ID, TEST_ERROR_MESSAGE);
    const expected = TEST_JSONRPC_ERROR;
    chai.expect(isEqual(result, expected)).to.be.true;
    // should also accept positive integers
    const input = { code: 4001, message: "User rejected request." };
    const output = formatJsonRpcError(TEST_ID, input);
    const jsonrpc = { id: TEST_ID, jsonrpc: "2.0", error: input };
    chai.expect(isEqual(output, jsonrpc)).to.be.true;
  });

  it("formatErrorMessage", () => {
    const message = "Something went wrong";
    const result = formatErrorMessage(message);
    const expected = TEST_ERROR;
    chai.expect(isEqual(result, expected)).to.be.true;
  });
});
