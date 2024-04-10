import { getError, getErrorByCode, isReservedErrorCode } from "./error";
import { INTERNAL_ERROR, SERVER_ERROR } from "./constants";
import { ErrorResponse, JsonRpcError, JsonRpcRequest, JsonRpcResult } from "./types";

class IncrementalRandomGenerator {
  private typedArray: Uint8Array | Uint16Array | Uint32Array;
  private shift: number;
  private base = 1;

  static getBitsOf(typedArray: Uint8Array | Uint16Array | Uint32Array) {
    if (!typedArray.length) {
      throw new Error("Empty typed array");
    }
    return (typedArray.byteLength / typedArray.length) * 8;
  }

  constructor(bits: 8 | 16 | 32) {
    this.typedArray =
      bits === 8 ? new Uint8Array(1) : bits === 16 ? new Uint16Array(1) : new Uint32Array(1);
    this.shift = IncrementalRandomGenerator.getBitsOf(this.typedArray);
  }

  getRandomValue() {
    return (this.base++ << this.shift) + crypto.getRandomValues(this.typedArray)[0];
  }
}

const uint8Generator = new IncrementalRandomGenerator(8);
const uint16Generator = new IncrementalRandomGenerator(16);

export function payloadId(entropy = 3): number {
  const generator = entropy > 3 ? uint16Generator : uint8Generator;
  const shift = entropy > 3 ? 10000 : 1000000;
  const date = Date.now() * Math.pow(10, shift);
  const extra = generator.getRandomValue();
  return date + extra;
}

export function getBigIntRpcId(entropy = 6): bigint {
  return BigInt(payloadId(entropy));
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
