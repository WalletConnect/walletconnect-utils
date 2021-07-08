import pino, { Logger } from 'pino';

import {
  formatChildLoggerContext,
  getDefaultLoggerOptions,
  generateChildLogger,
} from '../src';

describe('Logger', () => {
  let logger: Logger;
  beforeAll(() => {
    logger = pino(getDefaultLoggerOptions());
  });
  it('init', () => {
    expect(logger).toBeTruthy();
  });
  it('context', async () => {
    const alphaContext = 'alpha';
    const alphaContextResult = formatChildLoggerContext(logger, alphaContext);
    const alphaContextExpected = alphaContext;
    expect(alphaContextResult).toEqual(alphaContextExpected);
    const alpha = generateChildLogger(logger, alphaContext);
    expect(alpha.custom_context).toBeTruthy();
    expect(alpha.custom_context).toEqual(alphaContextExpected);
    expect(alpha.bindings().context).toEqual(alphaContextExpected);
    expect(alphaContextResult).toEqual(alphaContextExpected);

    const betaContext = 'beta';
    const betaContextResult = formatChildLoggerContext(alpha, betaContext);
    const betaContextExpected = alphaContextExpected + '/' + betaContext;
    expect(betaContextResult).toEqual(betaContextExpected);
    const beta = generateChildLogger(alpha, betaContext);
    expect(beta.custom_context).toBeTruthy();
    expect(beta.custom_context).toEqual(betaContextExpected);
    expect(beta.bindings().context).toEqual(betaContextExpected);
    expect(betaContextResult).toEqual(betaContextExpected);

    const gammaContext = 'gamma';
    const gammaContextExpected = betaContextExpected + '/' + gammaContext;
    const gammaContextResult = formatChildLoggerContext(beta, gammaContext);
    expect(gammaContextResult).toEqual(gammaContextExpected);
    const gamma = generateChildLogger(beta, gammaContext);
    expect(gamma.custom_context).toBeTruthy();
    expect(gamma.custom_context).toEqual(gammaContextExpected);
    expect(gamma.bindings().context).toEqual(gammaContextExpected);
    expect(gammaContextResult).toEqual(gammaContextExpected);
  });
});
