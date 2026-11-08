import { EventEmitter } from "events";
import { safeJsonParse, safeJsonStringify } from "@walletconnect/safe-json";
import {
  formatJsonRpcError,
  ITerminalJsonRpcConnection,
  JsonRpcPayload,
  isReactNative,
  isWsUrl,
  isLocalhostUrl,
  parseConnectionError,
} from "@walletconnect/jsonrpc-utils";
import { truncateQuery, resolveWebSocketImplementation, hasBuiltInWebSocket } from "./utils";

const WS = resolveWebSocketImplementation();

type SocketConnection = {
  socket: WebSocket;
  opened: boolean;
  closing: boolean;
  registration: Promise<WebSocket>;
  resolveRegistration(socket: WebSocket): void;
  rejectRegistration(error: Error): void;
  close?: Promise<void>;
  resolveClose?: () => void;
  removeErrorListener?: () => void;
};

export class WsConnection implements ITerminalJsonRpcConnection {
  public events = new EventEmitter();

  private socket: WebSocket | undefined;

  private current: SocketConnection | undefined;

  private disposed = false;

  private disposal: Promise<void> | undefined;

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
    return !!this.current && !this.current.opened && !this.current.closing;
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
    const connection = this.current;
    if (!connection) throw new Error("Connection already closed");
    if (connection.close) return connection.close;
    connection.closing = true;
    this.socket = undefined;
    connection.rejectRegistration(new Error("Connection closed"));
    connection.close = new Promise<void>((resolve, reject) => {
      connection.resolveClose = resolve;
      try {
        if (connection.socket.readyState === 3) this.onClose(connection);
        else connection.socket.close();
      } catch (error) {
        reject(error);
      }
    });
    return connection.close;
  }

  public dispose(): Promise<void> {
    if (this.disposal) return this.disposal;
    this.disposed = true;
    let resolve!: () => void;
    let reject!: (error: unknown) => void;
    this.disposal = new Promise<void>((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
    // Reserve the terminal promise before close can invoke an event listener.
    (this.current ? this.close() : Promise.resolve()).then(() => {
      this.events.removeAllListeners();
      resolve();
    }, reject);
    return this.disposal;
  }

  public async send(payload: JsonRpcPayload): Promise<void> {
    this.assertActive();
    const socket = this.socket ?? (await this.register());
    this.assertActive();
    if (this.socket !== socket || this.current?.closing) throw new Error("Connection closed");
    try {
      socket.send(safeJsonStringify(payload));
    } catch (e) {
      this.onError(payload.id, e as Error);
    }
  }

  // ---------- Private ----------------------------------------------- //

  private register(url = this.url): Promise<WebSocket> {
    this.assertActive();
    if (!isWsUrl(url)) {
      throw new Error(`Provided URL is not compatible with WebSocket connection: ${url}`);
    }
    if (this.current?.closing) {
      return this.current.close!.then(() => this.register(url));
    }
    if (this.current && url !== this.url) {
      return this.close().then(() => this.register(url));
    }
    if (this.current) return this.current.registration;
    this.url = url;
    let resolveRegistration!: (socket: WebSocket) => void;
    let rejectRegistration!: (error: Error) => void;
    const registration = new Promise<WebSocket>((resolve, reject) => {
      resolveRegistration = resolve;
      rejectRegistration = reject;
    });
    // close/dispose can reject registration before a consumer attaches its handler.
    registration.catch(() => undefined);
    const opts = !isReactNative() ? { rejectUnauthorized: !isLocalhostUrl(url) } : undefined;
    const socket: WebSocket = new WS(url, [], opts);
    const connection: SocketConnection = {
      socket,
      opened: false,
      closing: false,
      registration,
      resolveRegistration,
      rejectRegistration,
    };
    this.current = connection;
    const onError = (error: Error) => {
      if (this.current !== connection || connection.closing || this.disposed) return;
      rejectRegistration(this.emitError(error));
    };
    if (hasBuiltInWebSocket()) {
      socket.onerror = (event: Event) => onError((event as ErrorEvent).error);
    } else {
      (socket as any).on("error", onError);
      connection.removeErrorListener = () => (socket as any).removeListener("error", onError);
    }
    socket.onopen = () => this.onOpen(connection);
    socket.onclose = (event) => this.onClose(connection, event);
    return registration;
  }

  private onOpen(connection: SocketConnection) {
    const { socket } = connection;
    if (this.current !== connection || connection.closing || this.disposed) {
      if (socket.readyState !== 2 && socket.readyState !== 3) socket.close();
      return;
    }
    socket.onmessage = (event: MessageEvent) => {
      if (this.current === connection) this.onPayload(event);
    };
    this.socket = socket;
    connection.opened = true;
    this.events.emit("open");
    connection.resolveRegistration(socket);
  }

  private onClose(connection: SocketConnection, event?: CloseEvent) {
    connection.rejectRegistration(new Error("Connection closed"));
    connection.removeErrorListener?.();
    connection.socket.onopen = null;
    connection.socket.onclose = null;
    connection.socket.onmessage = null;
    connection.socket.onerror = null;
    if (this.current === connection) {
      this.socket = undefined;
      this.current = undefined;
      try {
        this.events.emit("close", event);
      } finally {
        connection.resolveClose?.();
      }
      return;
    }
    connection.resolveClose?.();
  }

  private onPayload(e: { data: any }) {
    if (this.disposed || !this.current?.opened || this.current.closing) return;
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
    return parseConnectionError(e, truncateQuery(url), "WS");
  }

  private assertActive() {
    if (this.disposed) throw new Error("Connection disposed");
  }

  private emitError(errorEvent: Error) {
    const error = this.parseError(
      new Error(
        errorEvent?.message || `WebSocket connection failed for host: ${truncateQuery(this.url)}`,
      ),
    );
    this.events.emit("register_error", error);
    return error;
  }
}

export default WsConnection;
