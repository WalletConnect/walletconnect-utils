import { MAX_LOG_SIZE_IN_BYTES_DEFAULT } from "./constants";
import type { LoggerOptions } from "pino";
import { levels } from "pino";
import CircularArray from "./circularArray";

export default class BaseChunkLogger {
  private logs: CircularArray;
  private level: LoggerOptions["level"];
  private levelValue: number;

  private MAX_LOG_SIZE_IN_BYTES: number;

  public constructor(
    level: LoggerOptions["level"],
    MAX_LOG_SIZE_IN_BYTES: number = MAX_LOG_SIZE_IN_BYTES_DEFAULT,
  ) {
    this.level = level ?? "error";
    this.levelValue = levels.values[this.level];

    this.MAX_LOG_SIZE_IN_BYTES = MAX_LOG_SIZE_IN_BYTES;
    this.logs = new CircularArray(MAX_LOG_SIZE_IN_BYTES);
  }

  public forwardToConsole(chunk: any, level: number) {
    if (level === levels.values.error) {
      // eslint-disable-next-line no-console
      console.error(chunk);
    } else if (level === levels.values.warn) {
      // eslint-disable-next-line no-console
      console.warn(chunk);
    } else {
      // eslint-disable-next-line no-console
      console.log(chunk);
    }
  }

  public appendToLogs(chunk: any) {
    this.logs.enqueue(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        log: chunk,
      }),
    );

    // Based on https://github.com/pinojs/pino/blob/master/lib/constants.js
    const level = typeof chunk === "string" ? JSON.parse(chunk).level : chunk.level;
    if (level >= this.levelValue) {
      this.forwardToConsole(chunk, level);
    }
  }

  public getLogs() {
    return this.logs;
  }

  public clearLogs() {
    this.logs = new CircularArray(this.MAX_LOG_SIZE_IN_BYTES);
  }

  public getLogArray() {
    return Array.from(this.logs);
  }

  public logsToBlob(extraMetadata: Record<string, string>) {
    this.logs.enqueue(JSON.stringify({ extraMetadata }));
    const blob = new Blob(this.getLogArray(), { type: "application/json" });
    return blob;
  }
}