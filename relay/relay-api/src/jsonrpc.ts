import { RelayJsonRpc } from "./types";

export const RELAY_JSONRPC: { [protocol: string]: RelayJsonRpc.Methods } = {
  waku: {
    publish: "waku_publish",
    subscribe: "waku_subscribe",
    subscription: "waku_subscription",
    unsubscribe: "waku_unsubscribe",
  },
  iridium: {
    publish: "iridium_publish",
    subscribe: "iridium_subscribe",
    subscription: "iridium_subscription",
    unsubscribe: "iridium_unsubscribe",
  },
};
