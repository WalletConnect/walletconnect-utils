import { JsonRpcRequest } from "@walletconnect/jsonrpc-types";

import { RelayJsonRpc } from "./types";
import { assertType } from "./misc";
import {
  isPublishMethod,
  isPublishParams,
  isSubscribeMethod,
  isSubscribeParams,
  isSubscriptionMethod,
  isSubscriptionParams,
  isUnsubscribeMethod,
  isUnsubscribeParams,
} from "./validators";

export function parseSubscribeRequest(
  request: JsonRpcRequest
): RelayJsonRpc.SubscribeParams {
  if (!isSubscribeMethod(request.method)) {
    throw new Error("JSON-RPC Request has invalid subscribe method");
  }
  if (!isSubscribeParams(request.params)) {
    throw new Error("JSON-RPC Request has invalid subscribe params");
  }
  const params = request.params as RelayJsonRpc.SubscribeParams;

  assertType(params, "topic");

  return params;
}

export function parsePublishRequest(
  request: JsonRpcRequest
): RelayJsonRpc.PublishParams {
  if (!isPublishMethod(request.method)) {
    throw new Error("JSON-RPC Request has invalid publish method");
  }
  if (!isPublishParams(request.params)) {
    throw new Error("JSON-RPC Request has invalid publish params");
  }
  const params = request.params as RelayJsonRpc.PublishParams;

  assertType(params, "topic");
  assertType(params, "message");
  assertType(params, "ttl", "number");

  return params;
}

export function parseUnsubscribeRequest(
  request: JsonRpcRequest
): RelayJsonRpc.UnsubscribeParams {
  if (!isUnsubscribeMethod(request.method)) {
    throw new Error("JSON-RPC Request has invalid unsubscribe method");
  }
  if (!isUnsubscribeParams(request.params)) {
    throw new Error("JSON-RPC Request has invalid unsubscribe params");
  }
  const params = request.params as RelayJsonRpc.UnsubscribeParams;

  assertType(params, "id");

  return params;
}

export function parseSubscriptionRequest(
  request: JsonRpcRequest
): RelayJsonRpc.SubscriptionParams {
  if (!isSubscriptionMethod(request.method)) {
    throw new Error("JSON-RPC Request has invalid subscription method");
  }
  if (!isSubscriptionParams(request.params)) {
    throw new Error("JSON-RPC Request has invalid subscription params");
  }
  const params = request.params as RelayJsonRpc.SubscriptionParams;

  assertType(params, "id");
  assertType(params, "data");

  return params;
}
