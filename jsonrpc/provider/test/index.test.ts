import "mocha";
import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import HttpConnection from "@walletconnect/jsonrpc-http-connection";
import WsConnection from "@walletconnect/jsonrpc-ws-connection";

import JsonRpcProvider from "../src";

chai.use(chaiAsPromised);

const TEST_RANDOM_HOST = "random.domain.that.does.not.exist";

const TEST_ETH_REQUEST = {
  method: "eth_chainId",
  params: [],
};
const TEST_ETH_RESULT = "0x1";

const TEST_WAKU_REQUEST = {
  method: "waku_subscribe",
  params: {
    topic: "ca838d59a3a3fe3824dab9ca7882ac9a2227c5d0284c88655b261a2fe85db270",
  },
};

const TEST_URL = {
  http: {
    good: `https://cloudflare-eth.com`,
    bad: `http://${TEST_RANDOM_HOST}`,
  },
  ws: {
    good: `wss://staging.walletconnect.org`,
    bad: `ws://${TEST_RANDOM_HOST}`,
  },
};

describe("@walletconnect/jsonrpc-provider", () => {
  describe("HTTP", () => {
    it("Successfully connects and requests", async () => {
      const connection = new HttpConnection(TEST_URL.http.good);
      const provider = new JsonRpcProvider(connection);
      await provider.connect();
      const result = await provider.request(TEST_ETH_REQUEST);
      chai.expect(!!result).to.be.true;
      chai.expect(result).to.eql(TEST_ETH_RESULT);
    });
    it("Successfully requests without calling connect", async () => {
      const connection = new HttpConnection(TEST_URL.http.good);
      const provider = new JsonRpcProvider(connection);
      const result = await provider.request(TEST_ETH_REQUEST);
      chai.expect(!!result).to.be.true;
      chai.expect(result).to.eql(TEST_ETH_RESULT);
    });
    it("Throws error when receives json-rpc error", async () => {
      const connection = new HttpConnection(TEST_URL.http.good);
      const provider = new JsonRpcProvider(connection);
      const promise = provider.request({ ...TEST_ETH_REQUEST, method: "test_method" });
      await chai.expect(promise).to.eventually.be.rejectedWith(`Method not found`);
    });
    it("Throws when connecting to unavailable host", async () => {
      const connection = new HttpConnection(TEST_URL.http.bad);
      const provider = new JsonRpcProvider(connection);
      const promise = provider.request(TEST_ETH_REQUEST);
      await chai
        .expect(promise)
        .to.eventually.be.rejectedWith(`Unavailable HTTP RPC url at ${TEST_URL.http.bad}`);
    });
    it("Reconnects with new provided host url", async () => {
      const connection = new HttpConnection(TEST_URL.http.bad);
      const provider = new JsonRpcProvider(connection);
      chai.expect((provider.connection as HttpConnection).url).to.equal(TEST_URL.http.bad);
      await provider.connect(TEST_URL.http.good);
      chai.expect((provider.connection as HttpConnection).url).to.equal(TEST_URL.http.good);
      const result = await provider.request(TEST_ETH_REQUEST);
      chai.expect(!!result).to.be.true;
      chai.expect(result).to.eql(TEST_ETH_RESULT);
    });
    it("does not re-register event listeners if previously registered", async () => {
      const connection = new HttpConnection(TEST_URL.http.good);
      const provider = new JsonRpcProvider(connection);

      const expectedDisconnectCount = 3;
      let disconnectCount = 0;

      provider.on("disconnect", () => {
        disconnectCount++;
      });

      await provider.connect();
      await provider.disconnect();
      await provider.connect();
      await provider.disconnect();
      await provider.connect();
      await provider.disconnect();
      chai.expect(disconnectCount).to.equal(expectedDisconnectCount);
    });
  });

  describe("WS", () => {
    it("Successfully connects and requests", async () => {
      const connection = new WsConnection(TEST_URL.ws.good);
      const provider = new JsonRpcProvider(connection);
      await provider.connect();
      const result = await provider.request(TEST_WAKU_REQUEST);
      chai.expect(!!result).to.be.true;
    });
    it("Successfully requests without calling connect", async () => {
      const connection = new WsConnection(TEST_URL.ws.good);
      const provider = new JsonRpcProvider(connection);
      const result = await provider.request(TEST_WAKU_REQUEST);
      chai.expect(!!result).to.be.true;
    });
    it("Throws error when receives json-rpc error", async () => {
      const connection = new WsConnection(TEST_URL.ws.good);
      const provider = new JsonRpcProvider(connection);
      const promise = provider.request({ ...TEST_WAKU_REQUEST, params: {} });
      await chai
        .expect(promise)
        .to.eventually.be.rejectedWith("JSON-RPC Request has invalid subscribe params");
    });
    it("Throws when connecting to unavailable host", async () => {
      const connection = new WsConnection(TEST_URL.ws.bad);
      const provider = new JsonRpcProvider(connection);
      const promise = provider.request(TEST_WAKU_REQUEST);
      await chai
        .expect(promise)
        .to.eventually.be.rejectedWith(`Unavailable WS RPC url at ${TEST_URL.ws.bad}`);
    });
    it("Reconnects with new provided host url", async () => {
      const connection = new WsConnection(TEST_URL.ws.bad);
      const provider = new JsonRpcProvider(connection);
      chai.expect((provider.connection as WsConnection).url).to.equal(TEST_URL.ws.bad);
      await provider.connect(TEST_URL.ws.good);
      chai.expect((provider.connection as WsConnection).url).to.equal(TEST_URL.ws.good);
      const result = await provider.request(TEST_WAKU_REQUEST);
      chai.expect(!!result).to.be.true;
    });
    it("does not re-register event listeners if previously registered", async () => {
      const connection = new WsConnection(TEST_URL.ws.good);
      const provider = new JsonRpcProvider(connection);

      // The socket is emitting an additional `close` event for each reconnection,
      // i.e. 3 explicit disconnects + 2 reconnections in between -> 5 `disconnect` emits.
      const expectedDisconnectCount = 5;
      let disconnectCount = 0;

      provider.on("disconnect", () => {
        disconnectCount++;
      });

      await provider.connect();
      await provider.disconnect();
      await provider.connect();
      await provider.disconnect();
      await provider.connect();
      await provider.disconnect();
      chai.expect(disconnectCount).to.equal(expectedDisconnectCount);
    });
  });
});
