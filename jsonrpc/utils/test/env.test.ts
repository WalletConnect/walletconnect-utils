import "mocha";
import * as chai from "chai";

import { isReactNative, isNodeJs, isBrowser } from "../src";

describe("Environment", () => {
  it("isReactNative", () => {
    chai.expect(isReactNative()).to.be.false;
  });
  it("isNodeJs", () => {
    chai.expect(isNodeJs()).to.be.true;
  });
  it("isBrowser", () => {
    chai.expect(isBrowser()).to.be.false;
  });
});
