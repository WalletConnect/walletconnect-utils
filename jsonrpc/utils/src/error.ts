import { ErrorResponse } from "./types";
import {
  INTERNAL_ERROR,
  SERVER_ERROR_CODE_RANGE,
  RESERVED_ERROR_CODES,
  STANDARD_ERROR_MAP,
} from "./constants";
import { JsonRpcError, JsonRpcValidation } from "@walletconnect/jsonrpc-types";

export function isServerErrorCode(code: number): boolean {
  return code <= SERVER_ERROR_CODE_RANGE[0] && code >= SERVER_ERROR_CODE_RANGE[1];
}

export function isReservedErrorCode(code: number): boolean {
  return RESERVED_ERROR_CODES.includes(code);
}

export function isValidErrorCode(code: number): boolean {
  return typeof code === "number";
}

export function getError(type: string): ErrorResponse {
  if (!Object.keys(STANDARD_ERROR_MAP).includes(type)) {
    return STANDARD_ERROR_MAP[INTERNAL_ERROR];
  }
  return STANDARD_ERROR_MAP[type];
}

export function getErrorByCode(code: number): ErrorResponse {
  const match = Object.values(STANDARD_ERROR_MAP).find(e => e.code === code);
  if (!match) {
    return STANDARD_ERROR_MAP[INTERNAL_ERROR];
  }
  return match;
}

export function validateJsonRpcError(response: JsonRpcError): JsonRpcValidation {
  if (typeof response.error.code === "undefined") {
    return { valid: false, error: "Missing code for JSON-RPC error" };
  }
  if (typeof response.error.message === "undefined") {
    return { valid: false, error: "Missing message for JSON-RPC error" };
  }
  if (!isValidErrorCode(response.error.code)) {
    return {
      valid: false,
      error: `Invalid error code type for JSON-RPC: ${response.error.code}`,
    };
  }
  if (isReservedErrorCode(response.error.code)) {
    const error = getErrorByCode(response.error.code);
    if (
      error.message !== STANDARD_ERROR_MAP[INTERNAL_ERROR].message &&
      response.error.message === error.message
    ) {
      return {
        valid: false,
        error: `Invalid error code message for JSON-RPC: ${response.error.code}`,
      };
    }
  }
  return { valid: true };
}

export function parseConnectionError(e: Error, url: string, type: string): Error {
  return e && (e.message.includes("getaddrinfo ENOTFOUND") || e.message.includes("connect ECONNREFUSED"))
    ? new Error(`Unavailable ${type} RPC url at ${url}`)
    : e;
}
