import "mocha";
import * as chai from "chai";

import {
  isValidRoute,
  isValidDefaultRoute,
  isValidWildcardRoute,
  isValidLeadingWildcardRoute,
  isValidTrailingWildcardRoute,
} from "../src";

describe("Routing", () => {
  it("isValidRoute", () => {
    chai.expect(isValidRoute("eth_chainId")).to.be.true;
    chai.expect(isValidRoute("eth_signTypedData_v1")).to.be.true;
    chai.expect(isValidRoute("eth_signTypedData_*")).to.be.true;
    chai.expect(isValidRoute("*_blockNumber")).to.be.true;
    chai.expect(isValidRoute("eth_chainId")).to.be.true;
    chai.expect(isValidRoute("eth_*")).to.be.true;
    chai.expect(isValidRoute("*")).to.be.true;
    chai.expect(isValidRoute("eth_sign*")).to.be.true;
    chai.expect(isValidRoute("eth+")).to.be.false;
    chai.expect(isValidRoute("**")).to.be.false;
    chai.expect(isValidRoute("eth_sign*Typed")).to.be.false;
  });
  it("isValidDefaultRoute", () => {
    chai.expect(isValidDefaultRoute("eth_chainId")).to.be.false;
    chai.expect(isValidDefaultRoute("eth_signTypedData_v1")).to.be.false;
    chai.expect(isValidDefaultRoute("eth_signTypedData_*")).to.be.false;
    chai.expect(isValidDefaultRoute("*_blockNumber")).to.be.false;
    chai.expect(isValidDefaultRoute("eth_chainId")).to.be.false;
    chai.expect(isValidDefaultRoute("eth_*")).to.be.false;
    chai.expect(isValidDefaultRoute("*")).to.be.true;
    chai.expect(isValidDefaultRoute("eth_sign*")).to.be.false;
    chai.expect(isValidDefaultRoute("eth+")).to.be.false;
    chai.expect(isValidDefaultRoute("**")).to.be.false;
    chai.expect(isValidDefaultRoute("eth_sign*Typed")).to.be.false;
  });
  it("isValidWildcardRoute", () => {
    chai.expect(isValidWildcardRoute("eth_chainId")).to.be.false;
    chai.expect(isValidWildcardRoute("eth_signTypedData_v1")).to.be.false;
    chai.expect(isValidWildcardRoute("eth_signTypedData_*")).to.be.true;
    chai.expect(isValidWildcardRoute("*_blockNumber")).to.be.true;
    chai.expect(isValidWildcardRoute("eth_chainId")).to.be.false;
    chai.expect(isValidWildcardRoute("eth_*")).to.be.true;
    chai.expect(isValidWildcardRoute("*")).to.be.true;
    chai.expect(isValidWildcardRoute("eth_sign*")).to.be.true;
    chai.expect(isValidWildcardRoute("eth+")).to.be.false;
    chai.expect(isValidWildcardRoute("**")).to.be.false;
    chai.expect(isValidWildcardRoute("eth_sign*Typed")).to.be.false;
  });
  it("isValidLeadingWildcardRoute", () => {
    chai.expect(isValidLeadingWildcardRoute("eth_chainId")).to.be.false;
    chai.expect(isValidLeadingWildcardRoute("eth_signTypedData_v1")).to.be.false;
    chai.expect(isValidLeadingWildcardRoute("eth_signTypedData_*")).to.be.false;
    chai.expect(isValidLeadingWildcardRoute("*_blockNumber")).to.be.true;
    chai.expect(isValidLeadingWildcardRoute("eth_chainId")).to.be.false;
    chai.expect(isValidLeadingWildcardRoute("eth_*")).to.be.false;
    chai.expect(isValidLeadingWildcardRoute("*")).to.be.false;
    chai.expect(isValidLeadingWildcardRoute("eth_sign*")).to.be.false;
    chai.expect(isValidLeadingWildcardRoute("eth+")).to.be.false;
    chai.expect(isValidLeadingWildcardRoute("**")).to.be.false;
    chai.expect(isValidLeadingWildcardRoute("eth_sign*Typed")).to.be.false;
  });
  it("isValidTrailingWildcardRoute", () => {
    chai.expect(isValidLeadingWildcardRoute("eth_chainId")).to.be.false;
    chai.expect(isValidTrailingWildcardRoute("eth_signTypedData_v1")).to.be.false;
    chai.expect(isValidTrailingWildcardRoute("eth_signTypedData_*")).to.be.true;
    chai.expect(isValidTrailingWildcardRoute("*_blockNumber")).to.be.false;
    chai.expect(isValidTrailingWildcardRoute("eth_chainId")).to.be.false;
    chai.expect(isValidTrailingWildcardRoute("eth_*")).to.be.true;
    chai.expect(isValidTrailingWildcardRoute("*")).to.be.false;
    chai.expect(isValidTrailingWildcardRoute("eth_sign*")).to.be.true;
    chai.expect(isValidTrailingWildcardRoute("eth+")).to.be.false;
    chai.expect(isValidTrailingWildcardRoute("**")).to.be.false;
    chai.expect(isValidTrailingWildcardRoute("eth_sign*Typed")).to.be.false;
  });
});
