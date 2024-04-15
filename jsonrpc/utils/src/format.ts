import { getError, getErrorByCode, isReservedErrorCode } from "./error";
import { INTERNAL_ERROR, SERVER_ERROR } from "./constants";
import { ErrorResponse, JsonRpcError, JsonRpcRequest, JsonRpcResult } from "./types";

class IncrementalRandomGenerator {
  private initialValue: number;
  private i = 1;

  constructor(bits: 8 | 16 | 32) {
    const typedArray =
      bits === 8 ? new Uint8Array(1) : bits === 16 ? new Uint16Array(1) : new Uint32Array(1);
    this.initialValue = crypto.getRandomValues(typedArray)[0];
  }

  getNextValue() {
    return this.initialValue + this.i++;
  }
}

const uint8Generator = new IncrementalRandomGenerator(8);
const uint32Generator = new IncrementalRandomGenerator(32);

export function payloadId(): number {
  const now = Date.now();
  const date = now * 1000;
  const extra = uint8Generator.getNextValue();
  return date + extra;
}

export function getBigIntRpcId(): bigint {
  const date = BigInt(Date.now()) * BigInt(10000000000);
  const extra = BigInt(uint32Generator.getNextValue());
  return date + extra;
}

export function formatJsonRpcRequest<T = any>(
  method: string,
  params: T,
  id?: number,
): JsonRpcRequest<T> {
  return {
    id: id || payloadId(),
    jsonrpc: "2.0",
    method,
    params,
  };
}

export function formatJsonRpcResult<T = any>(id: number, result: T): JsonRpcResult<T> {
  return {
    id,
    jsonrpc: "2.0",
    result,
  };
}

export function formatJsonRpcError(
  id: number,
  error?: string | ErrorResponse,
  data?: string,
): JsonRpcError {
  return {
    id,
    jsonrpc: "2.0",
    error: formatErrorMessage(error, data),
  };
}

export function formatErrorMessage(error?: string | ErrorResponse, data?: string): ErrorResponse {
  if (typeof error === "undefined") {
    return getError(INTERNAL_ERROR);
  }
  if (typeof error === "string") {
    error = {
      ...getError(SERVER_ERROR),
      message: error,
    };
  }
  if (typeof data !== "undefined") {
    error.data = data;
  }
  if (isReservedErrorCode(error.code)) {
    error = getErrorByCode(error.code);
  }
  return error;
}
