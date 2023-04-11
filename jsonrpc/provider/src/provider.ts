import { EventEmitter } from "events";
import {
  RequestArguments,
  IJsonRpcProvider,
  IJsonRpcConnection,
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

  private hasRegisteredEventListeners = false;

  constructor(connection: IJsonRpcConnection) {
    super(connection);
    this.connection = this.setConnection(connection);
    if (this.connection.connected) {
      this.registerEventListeners();
    }
  }

  public async connect(connection: string | IJsonRpcConnection = this.connection): Promise<void> {
    await this.open(connection);
  }

  public async disconnect(): Promise<void> {
    await this.close();
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
  ): Promise<Result> {
    return this.requestStrict(
      formatJsonRpcRequest(
        request.method,
        request.params || [],
        getBigIntRpcId().toString() as any,
      ), // casting to any is required in order to use BigInt as rpcId
      context,
    );
  }

  // ---------- Protected ----------------------------------------------- //

  protected async requestStrict<Result = any, Params = any>(
    request: JsonRpcRequest<Params>,
    context?: any,
  ): Promise<Result> {
    return new Promise(async (resolve, reject) => {
      if (!this.connection.connected) {
        try {
          await this.open();
        } catch (e) {
          reject(e);
        }
      }
      this.events.on(`${request.id}`, response => {
        if (isJsonRpcError(response)) {
          reject(response.error);
        } else {
          resolve(response.result);
        }
      });
      try {
        await this.connection.send(request, context);
      } catch (e) {
        reject(e);
      }
    });
  }

  protected setConnection(connection: IJsonRpcConnection = this.connection) {
    return connection;
  }

  protected onPayload(payload: JsonRpcPayload): void {
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
    if (this.connection === connection && this.connection.connected) return;
    if (this.connection.connected) this.close();
    if (typeof connection === "string") {
      await this.connection.open(connection);
      connection = this.connection;
    }
    this.connection = this.setConnection(connection);
    await this.connection.open();
    this.registerEventListeners();
    this.events.emit("connect");
  }

  protected async close() {
    await this.connection.close();
  }

  // ---------- Private ----------------------------------------------- //

  private registerEventListeners() {
    if (this.hasRegisteredEventListeners) return;
    this.connection.on("payload", (payload: JsonRpcPayload) => this.onPayload(payload));
    this.connection.on("close", (event?: CloseEvent) => this.onClose(event));
    this.connection.on("error", (error: Error) => this.events.emit("error", error));
    this.connection.on("register_error", (error: Error) => this.onClose());
    this.hasRegisteredEventListeners = true;
  }
}

export default JsonRpcProvider;
