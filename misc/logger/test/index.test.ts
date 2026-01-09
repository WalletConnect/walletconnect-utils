import "mocha";
import * as chai from "chai";
import sinon from "sinon";

import pino, { Logger } from "pino";

import {
  formatChildLoggerContext,
  getDefaultLoggerOptions,
  generateChildLogger,
  generateServerLogger,
  generatePlatformLogger,
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
    chai.expect(alpha["custom_context"]).to.not.be.undefined;
    chai.expect(alpha["custom_context"]).to.eql(alphaContextExpected);
    chai.expect(alpha.bindings().context).to.eql(alphaContextExpected);
    chai.expect(alphaContextResult).to.eql(alphaContextExpected);

    const betaContext = "beta";
    const betaContextResult = formatChildLoggerContext(alpha, betaContext);
    const betaContextExpected = alphaContextExpected + "/" + betaContext;
    chai.expect(betaContextResult).to.eql(betaContextExpected);
    const beta = generateChildLogger(alpha, betaContext);
    chai.expect(beta["custom_context"]).to.not.be.undefined;
    chai.expect(beta["custom_context"]).to.eql(betaContextExpected);
    chai.expect(beta.bindings().context).to.eql(betaContextExpected);
    chai.expect(betaContextResult).to.eql(betaContextExpected);

    const gammaContext = "gamma";
    const gammaContextExpected = betaContextExpected + "/" + gammaContext;
    const gammaContextResult = formatChildLoggerContext(beta, gammaContext);
    chai.expect(gammaContextResult).to.eql(gammaContextExpected);
    const gamma = generateChildLogger(beta, gammaContext);
    chai.expect(gamma["custom_context"]).to.not.be.undefined;
    chai.expect(gamma["custom_context"]).to.eql(gammaContextExpected);
    chai.expect(gamma.bindings().context).to.eql(gammaContextExpected);
    chai.expect(gammaContextResult).to.eql(gammaContextExpected);
  });

  describe("Chunk logging", () => {
    describe("Server Chunk Logger", () => {
      it("Maintains all logs internally", () => {
        const { logger, chunkLoggerController } = generateServerLogger({});
        logger.warn("Bar");
        logger.info("Foo1");
        logger.info("Foo2");
        logger.warn("Bar");
        logger.error("Baz");

        const logArray = chunkLoggerController.getLogArray();

        chai.expect(logArray.length).eq(5);
        chai.expect(logArray.filter((log) => log.includes("Bar")).length).eq(2);
        chai.expect(logArray.filter((log) => log.includes("Foo1")).length).eq(1);
        chai.expect(logArray.filter((log) => log.includes("Foo2")).length).eq(1);
        chai.expect(logArray.filter((log) => log.includes("Baz")).length).eq(1);
      });

      it("Forwards logs to console when necessary", () => {
        const consoleWarn = sinon.stub(console, "warn");
        const consoleError = sinon.stub(console, "error");
        const { logger, chunkLoggerController } = generateServerLogger({
          opts: {
            level: "error",
          },
        });

        const aString = "a".repeat(4);
        const bString = "b".repeat(4);

        logger.warn(aString);
        logger.error(bString);

        const logArray = chunkLoggerController.getLogArray();

        chai.expect(consoleWarn.called).eq(false);
        chai.expect(consoleError.called).eq(true);

        chai.expect(logArray.filter((log) => log.includes(aString)).length).eq(1);
        chai.expect(logArray.filter((log) => log.includes(bString)).length).eq(1);

        consoleError.restore();
        consoleWarn.restore();
      });

      it("Does not store more than MAX_SIZE_IN_BYTES bytes", () => {
        // An empty message would be logged like this:
        // {"timestamp":"2024-03-15T12:38:04.478Z","log":"{\"level\":30,\"time\":1710506284478,\"pid\":197898,\"hostname\":\"crater\",\"msg\":\"\"}\n"}
        // Which is 140 bytes, which has to be accounted for here.
        const BASE_LOG_SIZE = 140;

        // The messages that will be tested with are 16 bytes wide.
        const TEST_MESSAGE_SIZE = 16;

        // 4 messages should be stored. No more.
        const maxTestByteSize = (BASE_LOG_SIZE + TEST_MESSAGE_SIZE) * 4;
        const { logger, chunkLoggerController } = generateServerLogger({
          maxSizeInBytes: maxTestByteSize,
        });

        const aString = "a".repeat(4);
        const bString = "b".repeat(4);
        const cString = "c".repeat(4);
        const dString = "d".repeat(4);
        const eString = "e".repeat(4);

        // Ensure we are making no assumptions about the number of bytes
        chai.expect(new TextEncoder().encode(aString).length).eq(4);

        logger.info(aString);
        logger.info(bString);
        logger.info(cString);
        logger.info(dString);
        logger.info(eString);

        const logArray = chunkLoggerController.getLogArray();

        // 4 of these strings should be 16 bytes, the `aString` should be discarded now
        chai.expect(logArray.length).eq(4);

        chai.expect(logArray.filter((log) => log.includes(bString)).length).eq(1);
        chai.expect(logArray.filter((log) => log.includes(cString)).length).eq(1);
        chai.expect(logArray.filter((log) => log.includes(dString)).length).eq(1);
        chai.expect(logArray.filter((log) => log.includes(eString)).length).eq(1);

        // `aString` log should have been knocked away in favor of eString
        chai.expect(logArray.filter((log) => log.includes(aString)).length).eq(0);
      });

      it("Handles big insertions", () => {
        // An empty message would be logged like this:
        // {"timestamp":"2024-03-15T12:38:04.478Z","log":"{\"level\":30,\"time\":1710506284478,\"pid\":197898,\"hostname\":\"crater\",\"msg\":\"\"}\n"}
        // Which is 140 bytes, which has to be accounted for here.
        const BASE_LOG_SIZE = 140;

        // The messages that will be tested with are 16 bytes wide.
        const TEST_MESSAGE_SIZE = 16;

        // 4 messages should be stored. No more.
        const maxTestByteSize = (BASE_LOG_SIZE + TEST_MESSAGE_SIZE) * 4;
        const { logger, chunkLoggerController } = generateServerLogger({
          maxSizeInBytes: maxTestByteSize,
        });

        const aString = "a".repeat(4);
        const bString = "b".repeat(4);
        const cString = "c".repeat(4);
        const dString = "d".repeat(4);
        const eString = "e".repeat(100);

        // Ensure we are making no assumptions about the number of bytes
        chai.expect(new TextEncoder().encode(aString).length).eq(4);

        logger.info(aString);
        logger.info(bString);
        logger.info(cString);
        logger.info(dString);
        logger.info(eString);

        const logArray = chunkLoggerController.getLogArray();

        // the `aString` and `bString` should be discarded now to make space for the big `eString`
        chai.expect(logArray.length).eq(3);

        chai.expect(logArray.filter((log) => log.includes(cString)).length).eq(1);
        chai.expect(logArray.filter((log) => log.includes(dString)).length).eq(1);
        chai.expect(logArray.filter((log) => log.includes(eString)).length).eq(1);

        // `aString` and `bString` logs should have been knocked away in favor of eString
        chai.expect(logArray.filter((log) => log.includes(aString)).length).eq(0);
        chai.expect(logArray.filter((log) => log.includes(bString)).length).eq(0);
      });

      it("Works when needing to iterate array head multiple times", () => {
        // An empty message would be logged like this:
        // {"timestamp":"2024-03-15T12:38:04.478Z","log":"{\"level\":30,\"time\":1710506284478,\"pid\":197898,\"hostname\":\"crater\",\"msg\":\"\"}\n"}
        // Which is 140 bytes, which has to be accounted for here.
        const BASE_LOG_SIZE = 140;

        // The messages that will be tested with are 16 bytes wide.
        const TEST_MESSAGE_SIZE = 16;

        // 4 messages should be stored. No more.
        const maxTestByteSize = (BASE_LOG_SIZE + TEST_MESSAGE_SIZE) * 4;
        const { logger, chunkLoggerController } = generateServerLogger({
          maxSizeInBytes: maxTestByteSize,
        });

        const aString = "a".repeat(4);
        const bString = "b".repeat(4);
        const cString = "c".repeat(4);
        const dString = "d".repeat(4);
        const eString = "e".repeat(4);
        const fString = "f".repeat(4);
        const gString = "g".repeat(4);
        const hString = "h".repeat(4);
        const iString = "i".repeat(4);
        const jString = "j".repeat(4);
        const kString = "k".repeat(4);
        const lString = "l".repeat(4);
        const mString = "m".repeat(4);
        const nString = "n".repeat(4);
        const oString = "o".repeat(4);
        const pString = "p".repeat(4);

        // Ensure we are making no assumptions about the number of bytes
        chai.expect(new TextEncoder().encode(aString).length).eq(4);

        logger.info(aString);
        logger.info(bString);
        logger.info(cString);
        logger.info(dString);
        logger.info(eString);
        logger.info(fString);
        logger.info(gString);
        logger.info(hString);
        logger.info(iString);
        logger.info(jString);
        logger.info(kString);
        logger.info(lString);
        logger.info(mString);
        logger.info(nString);
        logger.info(oString);
        logger.info(pString);

        const logArray = chunkLoggerController.getLogArray();
        console.log({ logArray });

        chai.expect(logArray.filter((log) => log.includes(bString)).length).eq(0);
        chai.expect(logArray.filter((log) => log.includes(cString)).length).eq(0);
        chai.expect(logArray.filter((log) => log.includes(dString)).length).eq(0);
        chai.expect(logArray.filter((log) => log.includes(eString)).length).eq(0);
        chai.expect(logArray.filter((log) => log.includes(aString)).length).eq(0);

        chai.expect(logArray.filter((log) => log.includes(mString)).length).eq(1);
        chai.expect(logArray.filter((log) => log.includes(nString)).length).eq(1);
        chai.expect(logArray.filter((log) => log.includes(oString)).length).eq(1);
        chai.expect(logArray.filter((log) => log.includes(pString)).length).eq(1);
      });
    });

    describe("Platform Logger", () => {
      let consoleTrace: sinon.SinonStub;
      let consoleDebug: sinon.SinonStub;
      let consoleLog: sinon.SinonStub;
      let consoleWarn: sinon.SinonStub;
      let consoleError: sinon.SinonStub;

      beforeEach(() => {
        consoleTrace = sinon.stub(console, "trace");
        consoleDebug = sinon.stub(console, "debug");
        consoleLog = sinon.stub(console, "log");
        consoleWarn = sinon.stub(console, "warn");
        consoleError = sinon.stub(console, "error");
      });

      afterEach(() => {
        consoleTrace.restore();
        consoleDebug.restore();
        consoleLog.restore();
        consoleWarn.restore();
        consoleError.restore();
      });

      it("Respects loggerOverride string as log level for console output", () => {
        // Use "warn" level (NOT "error") to avoid coincidentally matching the default
        // The default level in BaseChunkLogger is "error", so using "error" here
        // would pass even if loggerOverride is not properly passed through
        const { logger, chunkLoggerController } = generatePlatformLogger({
          loggerOverride: "warn",
        });

        logger.trace("trace message");
        logger.debug("debug message");
        logger.info("info message");
        logger.warn("warn message");
        logger.error("error message");

        const logArray = chunkLoggerController!.getLogArray();

        // All logs should be stored in memory
        chai.expect(logArray.length).eq(5);

        // Only warn and error should be forwarded to console
        chai.expect(consoleTrace.called).eq(false);
        chai.expect(consoleDebug.called).eq(false);
        chai.expect(consoleLog.called).eq(false);
        chai.expect(consoleWarn.called).eq(true);
        chai.expect(consoleError.called).eq(true);
      });

      it("Stores all logs in memory regardless of level", () => {
        const { logger, chunkLoggerController } = generatePlatformLogger({
          loggerOverride: "warn",
        });

        logger.trace("trace");
        logger.debug("debug");
        logger.info("info");
        logger.warn("warn");
        logger.error("error");

        const logArray = chunkLoggerController!.getLogArray();

        // All 5 logs should be stored
        chai.expect(logArray.filter((log) => log.includes("trace")).length).eq(1);
        chai.expect(logArray.filter((log) => log.includes("debug")).length).eq(1);
        chai.expect(logArray.filter((log) => log.includes("info")).length).eq(1);
        chai.expect(logArray.filter((log) => log.includes("warn")).length).eq(1);
        chai.expect(logArray.filter((log) => log.includes("error")).length).eq(1);
      });
    });
  });
});
