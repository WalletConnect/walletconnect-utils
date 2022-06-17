import { RelayJsonRpc } from "./types";

export const RELAY_JSONRPC: { [protocol: string]: RelayJsonRpc.Methods } = {
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
