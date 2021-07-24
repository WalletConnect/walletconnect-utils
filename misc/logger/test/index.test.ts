import "mocha";
import * as chai from "chai";

import pino, { Logger } from "pino";

import {
  formatChildLoggerContext,
  getDefaultLoggerOptions,
  generateChildLogger,
} from "../src";

describe("Logger", () => {
  let logger: Logger;
  before(() => {
    logger = pino(getDefaultLoggerOptions());
  });
  it("init", () => {
    chai.expect(logger).to.not.be.undefined;
  });
  it("context", async () => {
    const alphaContext = "alpha";
    const alphaContextResult = formatChildLoggerContext(logger, alphaContext);
    const alphaContextExpected = alphaContext;
    chai.expect(alphaContextResult).to.eql(alphaContextExpected);
    const alpha = generateChildLogger(logger, alphaContext);
    chai.expect(alpha.custom_context).to.not.be.undefined;
    chai.expect(alpha.custom_context).to.eql(alphaContextExpected);
    chai.expect(alpha.bindings().context).to.eql(alphaContextExpected);
    chai.expect(alphaContextResult).to.eql(alphaContextExpected);

    const betaContext = "beta";
    const betaContextResult = formatChildLoggerContext(alpha, betaContext);
    const betaContextExpected = alphaContextExpected + "/" + betaContext;
    chai.expect(betaContextResult).to.eql(betaContextExpected);
    const beta = generateChildLogger(alpha, betaContext);
    chai.expect(beta.custom_context).to.not.be.undefined;
    chai.expect(beta.custom_context).to.eql(betaContextExpected);
    chai.expect(beta.bindings().context).to.eql(betaContextExpected);
    chai.expect(betaContextResult).to.eql(betaContextExpected);

    const gammaContext = "gamma";
    const gammaContextExpected = betaContextExpected + "/" + gammaContext;
    const gammaContextResult = formatChildLoggerContext(beta, gammaContext);
    chai.expect(gammaContextResult).to.eql(gammaContextExpected);
    const gamma = generateChildLogger(beta, gammaContext);
    chai.expect(gamma.custom_context).to.not.be.undefined;
    chai.expect(gamma.custom_context).to.eql(gammaContextExpected);
    chai.expect(gamma.bindings().context).to.eql(gammaContextExpected);
    chai.expect(gammaContextResult).to.eql(gammaContextExpected);
  });
});
