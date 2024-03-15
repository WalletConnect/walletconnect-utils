import pino, { Logger, LoggerOptions } from "pino";
import type { Writable } from 'stream'

import { PINO_CUSTOM_CONTEXT_KEY, PINO_LOGGER_DEFAULTS } from "./constants";

export function getDefaultLoggerOptions(opts?: LoggerOptions): LoggerOptions {
  return {
    ...opts,
    level: opts?.level || PINO_LOGGER_DEFAULTS.level,
  };
}

export function getBrowserLoggerContext(
  logger: Logger,
  customContextKey: string = PINO_CUSTOM_CONTEXT_KEY,
): string {
  return (logger as any)[customContextKey] || "";
}

export function setBrowserLoggerContext(
  logger: Logger,
  context: string,
  customContextKey: string = PINO_CUSTOM_CONTEXT_KEY,
): Logger {
  (logger as any)[customContextKey] = context;
  return logger;
}

export function getLoggerContext(
  logger: Logger,
  customContextKey: string = PINO_CUSTOM_CONTEXT_KEY,
): string {
  let context = "";
  // logger.bindings is undefined in browser
  if (typeof logger.bindings === "undefined") {
    context = getBrowserLoggerContext(logger, customContextKey);
  } else {
    context = logger.bindings().context || "";
  }
  return context;
}

export function formatChildLoggerContext(
  logger: Logger,
  childContext: string,
  customContextKey: string = PINO_CUSTOM_CONTEXT_KEY,
): string {
  const parentContext = getLoggerContext(logger, customContextKey);
  const context = parentContext.trim() ? `${parentContext}/${childContext}` : childContext;
  return context;
}

export function generateChildLogger(
  logger: Logger,
  childContext: string,
  customContextKey: string = PINO_CUSTOM_CONTEXT_KEY,
): Logger {
  const context = formatChildLoggerContext(logger, childContext, customContextKey);
  const child = logger.child({ context });
  return setBrowserLoggerContext(child, context, customContextKey);
}


export function generateBrowserLogger(params: {
  writeFunction: (obj: object) => void,
  opts?: LoggerOptions
}) {
  const logger = pino({
    ...params.opts,
    browser: {
      ...params.opts?.browser,
      write: (obj) => params.writeFunction(obj),
    }
  })

  return logger;
}

export function generateServerLogger(params: {
  stream: Writable,
  opts?: LoggerOptions
}) {
  const logger = pino({
    ...params.opts
  }, params.stream)

  return logger;
}
