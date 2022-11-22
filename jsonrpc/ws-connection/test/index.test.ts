import "mocha";
import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { WsConnection } from "./../src/ws";
import { FULL_RELAY_WS_URL, WSS_HOST, WS_HOST } from "./shared/values";

chai.use(chaiAsPromised);

describe("@walletconnect/jsonrpc-ws-connection", () => {
  describe("init", () => {
    it("does not initialise with an invalid `ws` string", async () => {
      chai
        .expect(() => new WsConnection("invalid"))
        .to.throw("Provided URL is not compatible with WebSocket connection: invalid");
    });
    it("initialises with a `ws:` string", async () => {
      const conn = new WsConnection(WS_HOST);
      chai.expect(conn instanceof WsConnection).to.be.true;
    });
    it("initialises with a `wss:` string", async () => {
      const conn = new WsConnection(WSS_HOST);
      chai.expect(conn instanceof WsConnection).to.be.true;
    });
  });

  describe("open", () => {
    it("can open a connection with a valid relay `wss:` URL", async () => {
      const conn = new WsConnection(FULL_RELAY_WS_URL);

      chai.expect(conn.connected).to.be.false;
      await conn.open();
      chai.expect(conn.connected).to.be.true;
    });
    it("surfaces an error if `wss:` URL is valid but connection cannot be made", async () => {
      const conn = new WsConnection(WSS_HOST);
      try {
        await conn.open();
      } catch (error) {
        chai.expect(error instanceof Error).to.be.true;
        chai.expect(error.message).to.equal("Unexpected server response: 400");
      }
    });
  });
});
