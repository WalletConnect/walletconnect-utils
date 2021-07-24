import "mocha";
import * as chai from "chai";

import * as env from "../src";

describe("Environment", () => {
  describe("isNode", () => {
    it("should return true", () => {
      const result = env.isNode();
      chai.expect(result).to.be.true;
    });
  });

  describe("isReactNative", () => {
    it("should return false", () => {
      const result = env.isReactNative();
      chai.expect(result).to.be.false;
    });
  });

  describe("isBrowser", () => {
    it("should return false", () => {
      const result = env.isBrowser();
      chai.expect(result).to.be.false;
    });
  });
});
