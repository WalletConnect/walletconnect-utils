import { MAX_LOG_SIZE_IN_BYTES_DEFAULT } from "./constants";
import { Writable } from "stream";
import type { LoggerOptions } from 'pino'
import BaseChunkLogger from "./baseChunkLogger";

export default class ServerChunkLogger extends Writable {
  private baseChunkLogger: BaseChunkLogger

  public constructor(level: LoggerOptions['level'], MAX_LOG_SIZE_IN_BYTES: number = MAX_LOG_SIZE_IN_BYTES_DEFAULT) {
    super({ objectMode: true });

    this.baseChunkLogger = new BaseChunkLogger(level, MAX_LOG_SIZE_IN_BYTES)
  }

  public _write(chunk: any): void {
    this.baseChunkLogger.appendToLogs(chunk)
  }

  public getLogs() {
    return this.baseChunkLogger.getLogs();
  }

  public clearLogs() {
    this.baseChunkLogger.clearLogs()
  }

  public getLogArray() {
    return this.baseChunkLogger.getLogArray()
  }

  public logsToBlob(extraMetadata: Record<string, string>) {
    return this.baseChunkLogger.logsToBlob(extraMetadata)
  }
}
