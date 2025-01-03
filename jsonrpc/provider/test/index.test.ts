import "mocha";
import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import HttpConnection from "@walletconnect/jsonrpc-http-connection";
import WsConnection from "@walletconnect/jsonrpc-ws-connection";
import * as relayAuth from "@walletconnect/relay-auth";
import { toString } from "uint8arrays";
import { randomBytes } from "@stablelib/random";
import utils, { formatRelayRpcUrl } from "@walletconnect/utils";
import { version } from "@walletconnect/utils/package.json";

import { fromString } from "uint8arrays/from-string";

import JsonRpcProvider from "../src";

if (!process.env.TEST_PROJECT_ID) {
  throw new Error("TEST_PROJECT_ID env var not set");
}

chai.use(chaiAsPromised);

const TEST_RANDOM_HOST = "random.domain.that.does.not.exist";

const TEST_ETH_REQUEST = {
  jsonrpc: "2.0",
  method: "eth_chainId",
  params: [],
  id: 1,
};
const TEST_ETH_RESULT = "0x1";
const BASE16 = "base16";
const TEST_IRN_REQUEST = {
  method: "irn_subscribe",
  params: {
    topic: "ca838d59a3a3fe3824dab9ca7882ac9a2227c5d0284c88655b261a2fe85db270",
  },
};

function generateRandomBytes32(): string {
  const random = randomBytes(32);
  return toString(random, BASE16);
}

const signJWT = async (aud: string) => {
  const keyPair = relayAuth.generateKeyPair(fromString(generateRandomBytes32(), BASE16));
  const sub = generateRandomBytes32();
  const ttl = 30000; //30 seconds
  const jwt = await relayAuth.signJWT(sub, aud, ttl, keyPair);

  return jwt;
};

const TEST_URL = {
  http: {
    good: `https://rpc.walletconnect.org/v1?chainId=eip155%3A1&projectId=${process.env.TEST_PROJECT_ID}`,
    bad: `http://${TEST_RANDOM_HOST}`,
  },
  ws: {
    good: `wss://staging.relay.walletconnect.com`,
    bad: `ws://${TEST_RANDOM_HOST}`,
  },
};

describe("@walletconnect/jsonrpc-provider", () => {
  before(async () => {
    const auth = await signJWT(TEST_URL.ws.good);
    const url = formatRelayRpcUrl({
      protocol: "wc",
      version: 2,
      sdkVersion: version,
      relayUrl: TEST_URL.ws.good,
      projectId: process.env.TEST_PROJECT_ID,
      auth,
    });

    TEST_URL.ws.good = url;
  });

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
      await chai.expect(promise).to.eventually.be.rejected;
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
      const result = await provider.request(TEST_IRN_REQUEST);
      chai.expect(!!result).to.be.true;
    });
    it("Successfully requests without calling connect", async () => {
      const connection = new WsConnection(TEST_URL.ws.good);
      const provider = new JsonRpcProvider(connection);
      const result = await provider.request(TEST_IRN_REQUEST);
      chai.expect(!!result).to.be.true;
    });
    it.skip("Throws error when receives json-rpc error", async () => {
      const connection = new WsConnection(TEST_URL.ws.good);
      const provider = new JsonRpcProvider(connection);
      const promise = provider.request({ ...TEST_IRN_REQUEST, params: {} });
      await chai
        .expect(promise)
        .to.eventually.be.rejectedWith("JSON-RPC Request has invalid subscribe params");
    });
    it("Throws when connecting to unavailable host", async () => {
      const connection = new WsConnection(TEST_URL.ws.bad);
      const provider = new JsonRpcProvider(connection);
      const promise = provider.request(TEST_IRN_REQUEST);
      await chai
        .expect(promise)
        .to.eventually.be.rejectedWith(`Unavailable WS RPC url at ${TEST_URL.ws.bad}`);
    });
    it("Reconnects with new provided host url", async () => {
      const connection = new WsConnection(TEST_URL.ws.bad);
      const provider = new JsonRpcProvider(connection);
      chai.expect((provider.connection as WsConnection).url).to.equal(TEST_URL.ws.bad);
      const relayUrl = TEST_URL.ws.good;
      await provider.connect(relayUrl);
      chai.expect((provider.connection as WsConnection).url).to.equal(relayUrl);
      const result = await provider.request(TEST_IRN_REQUEST);
      chai.expect(!!result).to.be.true;
    });
    it("does not re-register event listeners if previously registered", async () => {
      const connection = new WsConnection(TEST_URL.ws.good);
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
});
