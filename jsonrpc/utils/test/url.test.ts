import "mocha";
import * as chai from "chai";

import { isLocalhostUrl } from "../src/url";

describe("URL", () => {
  describe("isLocalhostUrl", () => {
    it("accepts exact loopback websocket hosts", () => {
      chai.expect(isLocalhostUrl("ws://localhost")).to.be.true;
      chai.expect(isLocalhostUrl("wss://localhost:8080")).to.be.true;
      chai.expect(isLocalhostUrl("ws://127.0.0.1:8545")).to.be.true;
      chai.expect(isLocalhostUrl("wss://[::1]:8080")).to.be.true;
    });

    it("rejects localhost prefix lookalikes", () => {
      chai.expect(isLocalhostUrl("wss://localhost.evil.example")).to.be.false;
      chai.expect(isLocalhostUrl("wss://localhostfoo")).to.be.false;
      chai.expect(isLocalhostUrl("wss://evil-localhost")).to.be.false;
      chai.expect(isLocalhostUrl("wss://example.com")).to.be.false;
    });

    it("rejects non-websocket schemes", () => {
      chai.expect(isLocalhostUrl("https://localhost")).to.be.false;
      chai.expect(isLocalhostUrl("http://127.0.0.1")).to.be.false;
    });
  });
});
