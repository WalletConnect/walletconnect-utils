import { RelayJsonRpc } from "./types";

export const RELAY_JSONRPC: { [protocol: string]: RelayJsonRpc.Methods } = {
  waku: {
    info: "waku_info",
    connect: "waku_connect",
    disconnect: "waku_disconnect",
    publish: "waku_publish",
    subscribe: "waku_subscribe",
    subscription: "waku_subscription",
    unsubscribe: "waku_unsubscribe",
  },
  iridium: {
    info: "iridium_info",
    connect: "iridium_connect",
    disconnect: "iridium_disconnect",
    publish: "iridium_publish",
    subscribe: "iridium_subscribe",
    subscription: "iridium_subscription",
    unsubscribe: "iridium_unsubscribe",
  },
};
