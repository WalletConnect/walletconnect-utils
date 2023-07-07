export const resolveWebSocketImplementation = () => {
  if (typeof WebSocket !== "undefined") {
    return WebSocket;
  } else if (typeof global !== "undefined" && typeof global.WebSocket !== "undefined") {
    return global.WebSocket;
  } else if (typeof window !== "undefined" && typeof window.WebSocket !== "undefined") {
    return window.WebSocket;
  } else if (typeof self !== "undefined" && typeof self.WebSocket !== "undefined") {
    return self.WebSocket;
  }

  return require("ws");
};

export const hasBuiltInWebSocket = () =>
  typeof WebSocket !== "undefined" ||
  (typeof global !== "undefined" && typeof global.WebSocket !== "undefined") ||
  (typeof window !== "undefined" && typeof window.WebSocket !== "undefined") ||
  (typeof self !== "undefined" && typeof self.WebSocket !== "undefined");

export const isBrowser = () => typeof window !== "undefined";

export const truncateQuery = (wssUrl: string) => wssUrl.split("?")[0];
