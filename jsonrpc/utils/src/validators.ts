import {
  JsonRpcError,
  JsonRpcPayload,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcResult,
  JsonRpcValidation,
  JsonRpcValidationInvalid,
} from "./types";

export function isJsonRpcPayload(payload: any): payload is JsonRpcPayload {
  return "id" in payload && "jsonrpc" in payload && payload.jsonrpc === "2.0";
}

export function isJsonRpcRequest<T = any>(payload: JsonRpcPayload): payload is JsonRpcRequest<T> {
  return isJsonRpcPayload(payload) && "method" in payload;
}

export function isJsonRpcResponse<T = any>(payload: JsonRpcPayload): payload is JsonRpcResponse<T> {
  return isJsonRpcPayload(payload) && (isJsonRpcResult(payload) || isJsonRpcError(payload));
}

export function isJsonRpcResult<T = any>(payload: JsonRpcPayload): payload is JsonRpcResult<T> {
  return "result" in payload;
}

export function isJsonRpcError(payload: JsonRpcPayload): payload is JsonRpcError {
  return "error" in payload;
}

export function isJsonRpcValidationInvalid(
  validation: JsonRpcValidation,
): validation is JsonRpcValidationInvalid {
  return "error" in validation && validation.valid === false;
}
