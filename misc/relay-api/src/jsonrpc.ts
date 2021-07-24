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
};
