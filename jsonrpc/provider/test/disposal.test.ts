import { describe, it } from "mocha";
import { strict as assert } from "assert";
import { EventEmitter } from "events";
import { IJsonRpcConnection, JsonRpcPayload } from "@walletconnect/jsonrpc-utils";

import { JsonRpcProvider } from "../src/provider";

const request = { method: "test", id: 1, params: [] };
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));
function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return { promise, resolve, reject };
}

class ControlledConnection extends IJsonRpcConnection {
  events = new EventEmitter();
  connected = false;
  connecting = false;
  sends = 0;
  closes = 0;
  disposals = 0;
  opening: Promise<void> | undefined;
  reply = false;
  on(event: string, listener: any) {
    this.events.on(event, listener);
  }

  once(event: string, listener: any) {
    this.events.once(event, listener);
  }

  off(event: string, listener: any) {
    this.events.off(event, listener);
  }

  removeListener(event: string, listener: any) {
    this.events.removeListener(event, listener);
  }

  async open() {
    this.connecting = true;
    await this.opening;
    this.connecting = false;
    this.connected = true;
  }

  async close() {
    this.closes++;
    this.connected = false;
    this.connecting = false;
    this.events.emit("close");
  }

  async dispose() {
    this.disposals++;
    await this.close();
  }

  async send(payload: JsonRpcPayload) {
    this.sends++;
    if (this.reply) this.events.emit("payload", { jsonrpc: "2.0", id: payload.id, result: true });
  }
}

describe("terminal JSON-RPC provider disposal", () => {
  it("rejects initialization and pending requests without dispatch after disposal", async () => {
    const connection = new ControlledConnection();
    const pending = deferred();
    connection.opening = pending.promise;
    const provider = new JsonRpcProvider(connection);
    let connects = 0;
    provider.on("connect", () => {
      connects++;
    });
    const connecting = provider.connect();
    const requested = provider.request(request);
    const refused = Promise.all([
      assert.rejects(connecting, /disposed/),
      assert.rejects(requested, /disposed/),
    ]);
    const disposal = provider.dispose();
    assert.equal(provider.dispose(), disposal);
    await Promise.all([disposal, refused]);
    pending.resolve();
    await tick();
    assert.equal(connects, 0);
    assert.equal(connection.sends, 0);
    assert.equal(connection.disposals, 1);
    await assert.rejects(provider.connect(), /disposed/);
    await assert.rejects(provider.request(request), /disposed/);
  });

  it("removes pending response listeners and every owned connection listener", async () => {
    const connection = new ControlledConnection();
    connection.connected = true;
    const provider = new JsonRpcProvider(connection);
    const pending = provider.request(request);
    const refused = assert.rejects(pending, /disposed/);
    await tick();
    assert.equal(connection.sends, 1);
    assert.equal(provider.events.listenerCount("1"), 1);
    await provider.dispose();
    await refused;
    assert.equal(provider.events.listenerCount("1"), 0);
    for (const event of ["payload", "close", "error", "register_error"])
      assert.equal(connection.events.listenerCount(event), 0);
  });

  it("stops a failed open before registering or sending the request", async () => {
    const connection = new ControlledConnection();
    connection.opening = Promise.reject(new Error("handshake failed"));
    const provider = new JsonRpcProvider(connection);
    await assert.rejects(provider.request(request), /handshake failed/);
    assert.equal(connection.sends, 0);
    assert.equal(provider.events.listenerCount("1"), 0);
    await provider.dispose();
  });

  it("preserves ordinary disconnect and reopen", async () => {
    const connection = new ControlledConnection();
    connection.reply = true;
    const provider = new JsonRpcProvider(connection);
    let disconnects = 0;
    provider.on("disconnect", () => {
      disconnects++;
    });
    assert.equal(await provider.request(request), true);
    await provider.disconnect();
    assert.equal(await provider.request({ ...request, id: 2 }), true);
    await provider.disconnect();
    assert.equal(disconnects, 2);
    assert.equal(provider.events.listenerCount("1"), 0);
    assert.equal(provider.events.listenerCount("2"), 0);
    await provider.dispose();
  });

  it("reports unsupported terminal disposal without substituting ordinary close", async () => {
    const connection = new ControlledConnection();
    connection.connected = true;
    Object.defineProperty(connection, "dispose", { value: undefined });
    const provider = new JsonRpcProvider(connection);
    const pending = assert.rejects(provider.request(request), /disposed/);
    await assert.rejects(provider.dispose(), /does not support terminal disposal/);
    await pending;
    assert.equal(connection.closes, 0);
    await assert.rejects(provider.connect(), /disposed/);
  });

  it("stays terminal and detached when connection disposal fails", async () => {
    const connection = new ControlledConnection();
    connection.connected = true;
    connection.dispose = async () => {
      throw new Error("close failed");
    };
    const provider = new JsonRpcProvider(connection);
    const pending = assert.rejects(provider.request(request), /disposed/);
    await assert.rejects(provider.dispose(), /close failed/);
    await pending;
    assert.equal(connection.events.listenerCount("payload"), 0);
    await assert.rejects(provider.request(request), /disposed/);
  });

  it("aborts only the requesting owner and removes its response listener", async () => {
    const connection = new ControlledConnection();
    connection.connected = true;
    const provider = new JsonRpcProvider(connection);
    const owner = new AbortController();
    const rejected = assert.rejects(
      provider.request(request, undefined, owner.signal),
      /owner retired/,
    );
    const other = provider.request({ ...request, id: 2 });
    owner.abort(new Error("owner retired"));
    await rejected;
    assert.equal(provider.events.listenerCount("1"), 0);
    assert.equal(provider.events.listenerCount("2"), 1);
    assert.equal(connection.connected, true);
    connection.events.emit("payload", { jsonrpc: "2.0", id: 1, result: "late" });
    connection.events.emit("payload", { jsonrpc: "2.0", id: 2, result: "current" });
    assert.equal(await other, "current");
    await provider.dispose();
  });
});
