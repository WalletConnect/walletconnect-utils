import "mocha";
import * as chai from "chai";

import { Watch, delay } from "../src";

describe("@walletconnect/time", () => {
  describe("Watch", () => {
    let time: Watch;
    before(() => {
      time = new Watch();
    });
    it("init", () => {
      chai.expect(time).to.not.be.undefined;
    });
    it("start & stop", async () => {
      const timeout = 1000;
      const before = Date.now();
      const label = "test";
      time.start(label);
      await delay(timeout);
      time.stop(label);
      const info = time.get(label);
      chai.expect(info).to.not.be.undefined;
      chai.expect(info.started >= before).to.be.true;
      if (typeof info.elapsed === "undefined")
        throw new Error("Elapsed must be defined after stop");
      chai.expect(info.elapsed).to.not.be.undefined;
      chai.expect(info.elapsed >= timeout).to.be.true;
    });
  });
});
