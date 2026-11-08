import { EventEmitter } from "events";
import {
  RequestArguments,
  IJsonRpcProvider,
  IJsonRpcConnection,
  ITerminalJsonRpcConnection,
  JsonRpcRequest,
  JsonRpcPayload,
  JsonRpcProviderMessage,
  isJsonRpcResponse,
  formatJsonRpcRequest,
  isJsonRpcError,
  getBigIntRpcId,
} from "@walletconnect/jsonrpc-utils";

export class JsonRpcProvider extends IJsonRpcProvider {
  public events = new EventEmitter();

  public connection: IJsonRpcConnection;

  private listeningConnection: IJsonRpcConnection | undefined;

  private disposed = false;

  private disposal: Promise<void> | undefined;

  private connectionEpoch = 0;

  private opening:
    | {
        connection: IJsonRpcConnection;
        url: string | undefined;
        promise: Promise<void>;
      }
    | undefined;

  private readonly pending = new Set<(error: Error) => void>();

  private readonly stopped: Promise<never>;

  private stop!: (error: Error) => void;

  private readonly connectionListeners = {
    payload: (payload: JsonRpcPayload) => this.onPayload(payload),
    close: (event?: CloseEvent) => this.onClose(event),
    error: (error: Error) => {
      if (!this.disposed) this.events.emit("error", error);
    },
    register_error: (_error: Error) => this.onClose(),
  };

  constructor(connection: IJsonRpcConnection) {
    super(connection);
    this.stopped = new Promise<never>((_resolve, reject) => {
      this.stop = reject;
    });
    this.stopped.catch(() => undefined);
    this.connection = this.setConnection(connection);
    if (this.connection.connected) {
      this.registerEventListeners();
    }
  }

  public async connect(connection: string | IJsonRpcConnection = this.connection): Promise<void> {
    await this.open(connection);
  }

  public async disconnect(): Promise<void> {
    this.assertActive();
    await this.close();
  }

  /** Terminally retire this provider and its owned connection. */
  public dispose(): Promise<void> {
    if (this.disposal) return this.disposal;
    this.disposed = true;
    this.connectionEpoch++;
    const error = new Error("Provider disposed");
    // Reserve disposal before invoking the connection's listener/cleanup methods.
    this.disposal = Promise.resolve().then(async () => {
      let listenerFailure: unknown;
      let listenersFailed = false;
      try {
        this.unregisterEventListeners();
      } catch (error) {
        listenersFailed = true;
        listenerFailure = error;
      }
      this.events.removeAllListeners();
      const connection = this.connection as Partial<ITerminalJsonRpcConnection>;
      if (typeof connection.dispose !== "function")
        throw new Error("Connection does not support terminal disposal");
      await connection.dispose();
      if (listenersFailed) throw listenerFailure;
    });
    this.stop(error);
    this.rejectPending(error);
    return this.disposal;
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

  public async request<Result = any, Params = any>(
    request: RequestArguments<Params>,
    context?: any,
    signal?: AbortSignal,
  ): Promise<Result> {
    this.assertActive();
    return this.requestStrict(
      formatJsonRpcRequest(
        request.method,
        request.params || [],
        request.id || (getBigIntRpcId().toString() as any),
      ), // casting to any is required in order to use BigInt as rpcId
      context,
      signal,
    );
  }

  // ---------- Protected ----------------------------------------------- //

  protected async requestStrict<Result = any, Params = any>(
    request: JsonRpcRequest<Params>,
    context?: any,
    signal?: AbortSignal,
  ): Promise<Result> {
    this.assertActive();
    return new Promise((resolve, reject) => {
      const event = `${request.id}`;
      const cleanup = () => {
        this.pending.delete(fail);
        this.events.off(event, onResponse);
        signal?.removeEventListener("abort", abort);
      };
      const fail = (error: Error) => {
        cleanup();
        reject(error);
      };
      const abort = () => fail(signal?.reason || new Error("Request aborted"));
      const onResponse = (response: JsonRpcPayload) => {
        cleanup();
        if (isJsonRpcError(response)) {
          reject(response.error);
        } else {
          resolve((response as any).result);
        }
      };
      this.pending.add(fail);
      this.events.on(event, onResponse);
      signal?.addEventListener("abort", abort, { once: true });
      if (signal?.aborted) {
        abort();
        return;
      }
      (async () => {
        try {
          if (!this.connection.connected) await this.open();
          this.assertActive();
          if (!this.pending.has(fail)) return;
          await Promise.race([this.connection.send(request, context), this.stopped]);
        } catch (error) {
          fail(error as Error);
        }
      })();
    });
  }

  protected setConnection(connection: IJsonRpcConnection = this.connection) {
    return connection;
  }

  protected onPayload(payload: JsonRpcPayload): void {
    if (this.disposed) return;
    this.events.emit("payload", payload);
    if (isJsonRpcResponse(payload)) {
      this.events.emit(`${payload.id}`, payload);
    } else {
      this.events.emit("message", {
        type: payload.method,
        data: payload.params,
      } as JsonRpcProviderMessage);
    }
  }

  protected onClose(event?: CloseEvent): void {
    if (this.disposed) return;
    this.rejectPending(new Error("Connection closed"));
    // Code 3000 indicates an abnormal closure signalled by the relay -> emit an error in this case.
    if (event && event.code === 3000) {
      this.events.emit(
        "error",
        new Error(
          `WebSocket connection closed abnormally with code: ${event.code} ${
            event.reason ? `(${event.reason})` : ""
          }`,
        ),
      );
    }
    this.events.emit("disconnect");
  }

  protected async open(connection: string | IJsonRpcConnection = this.connection) {
    this.assertActive();
    const target = typeof connection === "string" ? this.connection : connection;
    const url = typeof connection === "string" ? connection : undefined;
    if (this.opening?.connection === target && this.opening.url === url)
      return this.opening.promise;
    if (this.connection === target && target.connected && url === undefined) return;
    const epoch = ++this.connectionEpoch;
    const assertCurrent = () => {
      this.assertActive();
      if (epoch !== this.connectionEpoch) throw new Error("Connection changed");
    };
    const promise = (async () => {
      if (this.connection.connected || this.connection.connecting) await this.closeConnection();
      assertCurrent();
      this.unregisterEventListeners();
      this.connection = this.setConnection(target);
      await Promise.race([target.open(url), this.stopped]);
      assertCurrent();
      this.registerEventListeners();
      this.events.emit("connect");
    })();
    const opening = { connection: target, url, promise };
    this.opening = opening;
    promise.then(
      () => {
        if (this.opening === opening) this.opening = undefined;
      },
      () => {
        if (this.opening === opening) this.opening = undefined;
      },
    );
    return promise;
  }

  protected async close() {
    this.connectionEpoch++;
    await this.closeConnection();
  }

  // ---------- Private ----------------------------------------------- //

  private registerEventListeners() {
    if (this.listeningConnection === this.connection) return;
    this.unregisterEventListeners();
    for (const [event, listener] of Object.entries(this.connectionListeners))
      this.connection.on(event, listener);
    this.listeningConnection = this.connection;
  }

  private unregisterEventListeners() {
    if (!this.listeningConnection) return;
    for (const [event, listener] of Object.entries(this.connectionListeners))
      this.listeningConnection.off(event, listener);
    this.listeningConnection = undefined;
  }

  private closeConnection() {
    this.rejectPending(new Error("Connection closed"));
    return this.connection.close();
  }

  private rejectPending(error: Error) {
    for (const reject of this.pending) reject(error);
  }

  private assertActive() {
    if (this.disposed) throw new Error("Provider disposed");
  }
}

export default JsonRpcProvider;
