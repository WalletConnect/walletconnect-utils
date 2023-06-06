import { EventEmitter } from "events";
import { safeJsonParse, safeJsonStringify } from "@walletconnect/safe-json";
import {
  formatJsonRpcError,
  IJsonRpcConnection,
  JsonRpcPayload,
  isReactNative,
  isWsUrl,
  isLocalhostUrl,
  parseConnectionError,
} from "@walletconnect/jsonrpc-utils";

// Source: https://nodejs.org/api/events.html#emittersetmaxlistenersn
const EVENT_EMITTER_MAX_LISTENERS_DEFAULT = 10;

const resolveWebSocketImplementation = () => {
  if (typeof global !== "undefined" && typeof global.WebSocket !== "undefined") {
    return global.WebSocket;
  }
  if (typeof window !== "undefined" && typeof window.WebSocket !== "undefined") {
    return window.WebSocket;
  }

  return require("ws");
};

const isBrowser = () => typeof window !== "undefined";

const WS = resolveWebSocketImplementation();

export class WsConnection implements IJsonRpcConnection {
  public events = new EventEmitter();

  private socket: WebSocket | undefined;

  private registering = false;

  constructor(public url: string) {
    if (!isWsUrl(url)) {
      throw new Error(`Provided URL is not compatible with WebSocket connection: ${url}`);
    }
    this.url = url;
  }

  get connected(): boolean {
    return typeof this.socket !== "undefined";
  }

  get connecting(): boolean {
    return this.registering;
  }

  public on(event: string, listener: any): void {
    this.events.on(event, listener);
  }

  public once(event: string, listener: any): void {
    this.events.once(event, listener);
  }

  public off(event: string, listener: any): void {
    this.events.off(event, listener);
  }

  public removeListener(event: string, listener: any): void {
    this.events.removeListener(event, listener);
  }

  public async open(url: string = this.url): Promise<void> {
    await this.register(url);
  }

  public async close(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (typeof this.socket === "undefined") {
        reject(new Error("Connection already closed"));
        return;
      }

      this.socket.onclose = event => {
        this.onClose(event);
        resolve();
      };

      this.socket.close();
    });
  }

  public async send(payload: JsonRpcPayload): Promise<void> {
    if (typeof this.socket === "undefined") {
      this.socket = await this.register();
    }
    try {
      this.socket.send(safeJsonStringify(payload));
    } catch (e) {
      this.onError(payload.id, e as Error);
    }
  }

  // ---------- Private ----------------------------------------------- //

  private register(url = this.url): Promise<WebSocket> {
    if (!isWsUrl(url)) {
      throw new Error(`Provided URL is not compatible with WebSocket connection: ${url}`);
    }
    if (this.registering) {
      const currentMaxListeners = this.events.getMaxListeners();
      if (
        this.events.listenerCount("register_error") >= currentMaxListeners ||
        this.events.listenerCount("open") >= currentMaxListeners
      ) {
        this.events.setMaxListeners(currentMaxListeners + 1);
      }
      return new Promise((resolve, reject) => {
        this.events.once("register_error", error => {
          this.resetMaxListeners();
          reject(error);
        });
        this.events.once("open", () => {
          this.resetMaxListeners();
          if (typeof this.socket === "undefined") {
            return reject(new Error("WebSocket connection is missing or invalid"));
          }
          resolve(this.socket);
        });
      });
    }
    this.url = url;
    this.registering = true;

    return new Promise((resolve, reject) => {
      const opts = !isReactNative() ? { rejectUnauthorized: !isLocalhostUrl(url) } : undefined;
      const socket: WebSocket = new WS(url, [], opts);
      if (isBrowser()) {
        socket.onerror = (event: Event) => {
          const errorEvent = event as ErrorEvent;
          reject(this.emitError(errorEvent.error));
        };
      } else {
        (socket as any).on("error", (errorEvent: any) => {
          reject(this.emitError(errorEvent));
        });
      }
      socket.onopen = () => {
        this.onOpen(socket);
        resolve(socket);
      };
    });
  }

  private onOpen(socket: WebSocket) {
    socket.onmessage = (event: MessageEvent) => this.onPayload(event);
    socket.onclose = event => this.onClose(event);
    this.socket = socket;
    this.registering = false;
    this.events.emit("open");
  }

  private onClose(event: CloseEvent) {
    this.socket = undefined;
    this.registering = false;
    this.events.emit("close", event);
  }

  private onPayload(e: { data: any }) {
    if (typeof e.data === "undefined") return;
    const payload: JsonRpcPayload = typeof e.data === "string" ? safeJsonParse(e.data) : e.data;
    this.events.emit("payload", payload);
  }

  private onError(id: number, e: Error) {
    const error = this.parseError(e);
    const message = error.message || error.toString();
    const payload = formatJsonRpcError(id, message);
    this.events.emit("payload", payload);
  }

  private parseError(e: Error, url = this.url) {
    return parseConnectionError(e, url, "WS");
  }

  private resetMaxListeners() {
    if (this.events.getMaxListeners() > EVENT_EMITTER_MAX_LISTENERS_DEFAULT) {
      this.events.setMaxListeners(EVENT_EMITTER_MAX_LISTENERS_DEFAULT);
    }
  }

  private emitError(errorEvent: Error) {
    const error = this.parseError(
      new Error(errorEvent?.message || `WebSocket connection failed for URL: ${this.url}`),
    );
    this.events.emit("register_error", error);
    return error;
  }
}

export default WsConnection;
