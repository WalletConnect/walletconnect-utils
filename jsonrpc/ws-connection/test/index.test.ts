import "mocha";
import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { WsConnection } from "./../src/ws";
import { RELAY_URL } from "./shared/values";
import * as relayAuth from "@walletconnect/relay-auth";
import { toString } from "uint8arrays";
import { randomBytes } from "@stablelib/random";
import { formatRelayRpcUrl } from "@walletconnect/utils";
import { version } from "@walletconnect/utils/package.json";
import { fromString } from "uint8arrays/from-string";

chai.use(chaiAsPromised);

const BASE16 = "base16";

function generateRandomBytes32(): string {
  const random = randomBytes(32);
  return toString(random, BASE16);
}

const signJWT = async (aud: string) => {
  const keyPair = relayAuth.generateKeyPair(fromString(generateRandomBytes32(), BASE16));
  const sub = generateRandomBytes32();
  const ttl = 5000; //5 seconds
  const jwt = await relayAuth.signJWT(sub, aud, ttl, keyPair);

  return jwt;
};

const formatRelayUrl = async () => {
  const auth = await signJWT(RELAY_URL);
  return formatRelayRpcUrl({
    protocol: "wc",
    version: 2,
    sdkVersion: version,
    relayUrl: RELAY_URL,
    projectId: "3cbaa32f8fbf3cdcc87d27ca1fa68069",
    auth,
  });
};

describe("@walletconnect/jsonrpc-ws-connection", () => {
  describe("init", () => {
    it("does not initialise with an invalid `ws` string", async () => {
      chai
        .expect(() => new WsConnection("invalid"))
        .to.throw("Provided URL is not compatible with WebSocket connection: invalid");
    });
    it("initialises with a `ws:` string", async () => {
      const conn = new WsConnection(await formatRelayUrl());
      chai.expect(conn instanceof WsConnection).to.be.true;
    });
    it("initialises with a `wss:` string", async () => {
      const conn = new WsConnection(await formatRelayUrl());
      chai.expect(conn instanceof WsConnection).to.be.true;
    });
  });

  describe("open", () => {
    it("can open a connection with a valid relay `wss:` URL", async () => {
      const conn = new WsConnection(await formatRelayUrl());

      chai.expect(conn.connected).to.be.false;
      await conn.open();
      chai.expect(conn.connected).to.be.true;
    });
    it("surfaces an error if `wss:` URL is valid but connection cannot be made", async () => {
      const conn = new WsConnection(await formatRelayUrl());
      try {
        await conn.open();
      } catch (error) {
        chai.expect(error instanceof Error).to.be.true;
        chai.expect(error.message).to.equal("Unexpected server response: 400");
      }
    });
  });
});
