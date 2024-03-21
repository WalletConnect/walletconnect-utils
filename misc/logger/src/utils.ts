import pino, { Logger, LoggerOptions } from "pino";
import { PINO_CUSTOM_CONTEXT_KEY, PINO_LOGGER_DEFAULTS } from "./constants";
import ClientChunkLogger from "./clientChunkLogger";
import ServerChunkLogger from "./serverChunkLogger";
import BaseChunkLogger from "./baseChunkLogger";

export interface ChunkLoggerController {
  logsToBlob: BaseChunkLogger["logsToBlob"];
  getLogArray: () => string[];
  clearLogs: () => void;
  downloadLogsBlobInBrowser?: ClientChunkLogger["downloadLogsBlobInBrowser"];
}

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

export function generateClientLogger(params: { opts?: LoggerOptions; maxSizeInBytes?: number }): {
  logger: Logger<any>;
  chunkLoggerController: ClientChunkLogger;
} {
  const clientLogger = new ClientChunkLogger(params.opts?.level, params.maxSizeInBytes);
  const logger = pino({
    ...params.opts,
    level: "trace",
    browser: {
      ...params.opts?.browser,
      write: (obj) => clientLogger.write(obj),
    },
  });

  return { logger, chunkLoggerController: clientLogger };
}

export function generateServerLogger(params: { maxSizeInBytes?: number; opts?: LoggerOptions }): {
  logger: Logger<any>;
  chunkLoggerController: ServerChunkLogger;
} {
  const serverLogger = new ServerChunkLogger(params.opts?.level, params.maxSizeInBytes);
  const logger = pino(
    {
      ...params.opts,
      level: "trace",
    },
    serverLogger,
  );

  return { logger, chunkLoggerController: serverLogger };
}

export function getPlatformLogger(params: {
  maxSizeInBytes?: number;
  opts?: LoggerOptions;
  loggerOverride: string | Logger<any>;
}): {
  logger: Logger<any>;
  chunkLoggerController: ChunkLoggerController | null;
} {
  if (typeof params.loggerOverride !== "undefined" && typeof params.loggerOverride !== "string") {
    return {
      logger: params.loggerOverride,
      chunkLoggerController: null,
    };
  }
  if (typeof window !== "undefined") {
    return generateServerLogger(params);
  } else {
    return generateClientLogger(params);
  }
}
