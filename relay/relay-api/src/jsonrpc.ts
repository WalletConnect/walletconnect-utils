import { RelayJsonRpc } from "./types";

export const RELAY_JSONRPC: { [protocol: string]: RelayJsonRpc.Methods } = {
  waku: {
    publish: "waku_publish",
    subscribe: "waku_subscribe",
    subscription: "waku_subscription",
    unsubscribe: "waku_unsubscribe",
  },
  irn: {
    publish: "irn_publish",
    subscribe: "irn_subscribe",
    subscription: "irn_subscription",
    unsubscribe: "irn_unsubscribe",
  },
  iridium: {
    publish: "iridium_publish",
    subscribe: "iridium_subscribe",
    subscription: "iridium_subscription",
    unsubscribe: "iridium_unsubscribe",
  },
};
