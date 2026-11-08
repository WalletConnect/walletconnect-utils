import { describe, it, before, beforeEach, after } from "mocha";
import { strict as assert } from "assert";
import { createServer } from "net";

class ControlledSocket {
  static instances: ControlledSocket[] = [];
  readyState = 0;
  closeCalls = 0;
  sent: string[] = [];
  onopen: (() => void) | null = null;
  onclose: ((event: unknown) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  onmessage: ((event: unknown) => void) | null = null;

  constructor(readonly url: string) {
    ControlledSocket.instances.push(this);
  }

  close() {
    this.closeCalls++;
    this.readyState = 2;
  }

  send(value: string) {
    assert.equal(this.readyState, 1);
    this.sent.push(value);
  }

  opened() {
    this.readyState = 1;
    this.onopen?.();
  }

  closed() {
    this.readyState = 3;
    this.onclose?.({ code: 1000 });
  }
}

describe("terminal WebSocket disposal", () => {
  const original = globalThis.WebSocket;
  let WsConnection: typeof import("../src/ws").WsConnection;
  before(() => {
    globalThis.WebSocket = ControlledSocket as unknown as typeof WebSocket;
    delete require.cache[require.resolve("../src/ws")];
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- Capture the injected WebSocket at module initialization.
    WsConnection = require("../src/ws").WsConnection;
  });
  beforeEach(() => {
    ControlledSocket.instances = [];
  });
  after(() => {
    globalThis.WebSocket = original;
    delete require.cache[require.resolve("../src/ws")];
  });

  it("disposes before opening and rejects future network entry", async () => {
    const connection = new WsConnection("wss://relay.example");
    const disposal = connection.dispose();
    assert.equal(connection.dispose(), disposal);
    await disposal;
    await assert.rejects(connection.open(), /disposed/);
    await assert.rejects(
      connection.send({ jsonrpc: "2.0", id: 1, method: "test", params: [] }),
      /disposed/,
    );
    assert.equal(ControlledSocket.instances.length, 0);
  });

  it("cancels a pending handshake and all joined openers, then waits for close", async () => {
    const connection = new WsConnection("wss://relay.example");
    let opens = 0;
    connection.on("open", () => {
      opens++;
    });
    const first = connection.open();
    const second = connection.open();
    const rejected = Promise.all([
      assert.rejects(first, /closed/),
      assert.rejects(second, /closed/),
    ]);
    const socket = ControlledSocket.instances[0];
    const lateOpen = socket.onopen!;
    let disposed = false;
    const disposal = connection.dispose().then(() => {
      disposed = true;
    });
    assert.equal(socket.closeCalls, 1);
    assert.equal(connection.connecting, false);
    await rejected;
    assert.equal(disposed, false);
    socket.readyState = 1;
    lateOpen();
    assert.equal(socket.closeCalls, 2);
    assert.equal(connection.connected, false);
    socket.closed();
    await disposal;
    lateOpen();
    assert.equal(connection.connected, false);
    assert.equal(opens, 0);
    assert.equal(ControlledSocket.instances.length, 1);
  });

  it("keeps ordinary close reusable after canceling a handshake", async () => {
    const connection = new WsConnection("wss://relay.example");
    const opening = connection.open();
    const rejected = assert.rejects(opening, /closed/);
    const old = ControlledSocket.instances[0];
    const close = connection.close();
    old.closed();
    await Promise.all([close, rejected]);
    const reopened = connection.open();
    const current = ControlledSocket.instances[1];
    current.opened();
    await reopened;
    await connection.send({ jsonrpc: "2.0", id: 1, method: "test", params: [] });
    assert.equal(current.sent.length, 1);
    const disposal = connection.dispose();
    current.closed();
    await disposal;
  });

  it("joins reentrant disposal from a synchronous close callback", async () => {
    const connection = new WsConnection("wss://relay.example");
    const opening = connection.open();
    const socket = ControlledSocket.instances[0];
    socket.opened();
    await opening;
    let reentrant: Promise<void> | undefined;
    connection.on("close", () => {
      reentrant = connection.dispose();
    });
    socket.close = () => socket.closed();
    const disposal = connection.dispose();
    assert.equal(reentrant, disposal);
    await disposal;
  });

  it("ignores a retired socket's captured payload callback after reopening", async () => {
    const connection = new WsConnection("wss://relay.example");
    const opening = connection.open();
    const old = ControlledSocket.instances[0];
    old.opened();
    await opening;
    const latePayload = old.onmessage!;
    let payloads = 0;
    connection.on("payload", () => {
      payloads++;
    });
    const closing = connection.close();
    old.closed();
    await closing;
    const reopened = connection.open();
    const current = ControlledSocket.instances[1];
    current.opened();
    await reopened;
    latePayload({ data: JSON.stringify({ jsonrpc: "2.0", id: 1, result: true }) });
    assert.equal(payloads, 0);
    const disposal = connection.dispose();
    current.closed();
    await disposal;
  });

  it("cancels the Node ws handshake without an unhandled error", async () => {
    globalThis.WebSocket = undefined as unknown as typeof WebSocket;
    delete require.cache[require.resolve("../src/ws")];
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- Exercise the real Node WebSocket implementation.
    const NodeWsConnection: typeof WsConnection = require("../src/ws").WsConnection;
    const sockets = new Set<import("net").Socket>();
    const server = createServer((socket) => {
      sockets.add(socket);
      socket.on("close", () => sockets.delete(socket));
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    try {
      const address = server.address();
      assert(address && typeof address === "object");
      const connection = new NodeWsConnection(`ws://127.0.0.1:${address.port}`);
      const opening = connection.open();
      const rejected = assert.rejects(opening, /Connection closed/);
      await Promise.all([connection.dispose(), rejected]);
      assert.equal(connection.connected, false);
      await assert.rejects(connection.open(), /disposed/);
    } finally {
      for (const socket of sockets) socket.destroy();
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
      globalThis.WebSocket = ControlledSocket as unknown as typeof WebSocket;
      delete require.cache[require.resolve("../src/ws")];
    }
  });
});
