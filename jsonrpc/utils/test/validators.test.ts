import "mocha";
import * as chai from "chai";

import {
  isJsonRpcRequest,
  isJsonRpcResponse,
  isJsonRpcResult,
  isJsonRpcError,
  isJsonRpcPayload,
} from "../src";
import { TEST_JSONRPC_ERROR, TEST_JSONRPC_REQUEST, TEST_JSONRPC_RESULT } from "./shared";

describe("Validators", () => {
  it("isJsonRpcPayload", () => {
    chai.expect(isJsonRpcPayload(TEST_JSONRPC_REQUEST)).to.be.true;
    chai.expect(isJsonRpcPayload(TEST_JSONRPC_RESULT)).to.be.true;
    chai.expect(isJsonRpcPayload(TEST_JSONRPC_ERROR)).to.be.true;
  });

  it("isJsonRpcRequest", () => {
    chai.expect(isJsonRpcRequest(TEST_JSONRPC_REQUEST)).to.be.true;
    chai.expect(isJsonRpcRequest(TEST_JSONRPC_RESULT)).to.be.false;
    chai.expect(isJsonRpcRequest(TEST_JSONRPC_ERROR)).to.be.false;
  });

  it("isJsonRpcResponse", () => {
    chai.expect(isJsonRpcResponse(TEST_JSONRPC_REQUEST)).to.be.false;
    chai.expect(isJsonRpcResponse(TEST_JSONRPC_RESULT)).to.be.true;
    chai.expect(isJsonRpcResponse(TEST_JSONRPC_ERROR)).to.be.true;
  });

  it("isJsonRpcResult", () => {
    chai.expect(isJsonRpcResult(TEST_JSONRPC_REQUEST)).to.be.false;
    chai.expect(isJsonRpcResult(TEST_JSONRPC_RESULT)).to.be.true;
    chai.expect(isJsonRpcResult(TEST_JSONRPC_ERROR)).to.be.false;
  });

  it("isJsonRpcError", () => {
    chai.expect(isJsonRpcError(TEST_JSONRPC_REQUEST)).to.be.false;
    chai.expect(isJsonRpcError(TEST_JSONRPC_RESULT)).to.be.false;
    chai.expect(isJsonRpcError(TEST_JSONRPC_ERROR)).to.be.true;
  });
});
