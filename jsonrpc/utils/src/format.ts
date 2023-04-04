import { getError, getErrorByCode, isReservedErrorCode, isServerErrorCode } from "./error";
import { INTERNAL_ERROR, SERVER_ERROR } from "./constants";
import { ErrorResponse, JsonRpcError, JsonRpcRequest, JsonRpcResult } from "./types";

export function payloadId(entropy = 3): number {
  const date = Date.now() * Math.pow(10, entropy);
  const extra = Math.floor(Math.random() * Math.pow(10, entropy));
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
