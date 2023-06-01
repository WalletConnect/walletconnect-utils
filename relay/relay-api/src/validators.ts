import { JsonRpcRequest } from "@walletconnect/jsonrpc-types";

import { checkParams, methodEndsWith } from "./misc";
import { RelayJsonRpc } from "./types";

// ---------- Subscribe ----------------------------------------------- //

export function isSubscribeRequest(
  request: JsonRpcRequest
): request is JsonRpcRequest<RelayJsonRpc.SubscribeParams> {
  return isSubscribeMethod(request.method) && isSubscribeParams(request.params);
}

export function isSubscribeMethod(method: string): boolean {
  return methodEndsWith(method, "subscribe");
}

export function isSubscribeParams(
  params: any
): params is RelayJsonRpc.SubscribeParams {
  const required = ["topic"];
  const optional: string[] = [];
  return checkParams(params, required, optional);
}

// ---------- Publish ----------------------------------------------- //

export function isPublishRequest(
  request: JsonRpcRequest
): request is JsonRpcRequest<RelayJsonRpc.PublishParams> {
  return isPublishMethod(request.method) && isPublishParams(request.params);
}

export function isPublishMethod(method: string): boolean {
  return methodEndsWith(method, "publish");
}

export function isPublishParams(
  params: any
): params is RelayJsonRpc.PublishParams {
  const required = ["message", "topic", "ttl"];
  const optional = ["prompt", "tag"];
  return checkParams(params, required, optional);
}

// ---------- Unsubscribe ----------------------------------------------- //

export function isUnsubscribeRequest(
  request: JsonRpcRequest
): request is JsonRpcRequest<RelayJsonRpc.UnsubscribeParams> {
  return (
    isUnsubscribeMethod(request.method) && isUnsubscribeParams(request.params)
  );
}

export function isUnsubscribeMethod(method: string): boolean {
  return methodEndsWith(method, "unsubscribe");
}

export function isUnsubscribeParams(
  params: any
): params is RelayJsonRpc.UnsubscribeParams {
  const required = ["id", "topic"];
  const optional: string[] = [];
  return checkParams(params, required, optional);
}

// ---------- Subscription ----------------------------------------------- //

export function isSubscriptionRequest(
  request: JsonRpcRequest
): request is JsonRpcRequest<RelayJsonRpc.SubscriptionParams> {
  return (
    isSubscriptionMethod(request.method) && isSubscriptionParams(request.params)
  );
}

export function isSubscriptionMethod(method: string): boolean {
  return methodEndsWith(method, "subscription");
}

export function isSubscriptionParams(
  params: any
): params is RelayJsonRpc.SubscriptionParams {
  const required = ["id", "data"];
  const optional: string[] = [];
  return checkParams(params, required, optional);
}
