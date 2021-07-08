import { JsonRpcPayload, JsonRpcRequest, RequestArguments } from "./jsonrpc";
import { IEvents } from "./misc";

export abstract class IJsonRpcConnection extends IEvents {
  public abstract connected: boolean;
  public abstract connecting: boolean;
  constructor(opts?: any) {
    super();
  }
  public abstract open(opts?: any): Promise<void>;
  public abstract close(): Promise<void>;
  public abstract send(payload: JsonRpcPayload, context?: any): Promise<void>;
}

export abstract class IBaseJsonRpcProvider extends IEvents {
  constructor() {
    super();
  }

  public abstract connect(params?: any): Promise<void>;

  public abstract disconnect(): Promise<void>;

  public abstract request<Result = any, Params = any>(
    request: RequestArguments<Params>,
    context?: any,
  ): Promise<Result>;

  // ---------- Protected ----------------------------------------------- //

  protected abstract requestStrict<Result = any, Params = any>(
    request: JsonRpcRequest<Params>,
    context?: any,
  ): Promise<Result>;
}

export abstract class IJsonRpcProvider extends IBaseJsonRpcProvider {
  public abstract connection: IJsonRpcConnection;

  constructor(connection: string | IJsonRpcConnection) {
    super();
  }

  public abstract connect(connection?: string | IJsonRpcConnection): Promise<void>;

  // ---------- Protected ----------------------------------------------- //

  protected abstract setConnection(connection?: string | IJsonRpcConnection): IJsonRpcConnection;

  protected abstract onPayload(payload: JsonRpcPayload): void;

  protected abstract open(connection?: string | IJsonRpcConnection): Promise<void>;

  protected abstract close(): Promise<void>;
}
