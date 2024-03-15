import { MAX_LOG_SIZE_IN_BYTES_DEFAULT } from "./constants";
import type { LoggerOptions } from "pino";
import BaseChunkLogger from "./baseChunkLogger";

export default class ClientChunkLogger {
  private baseChunkLogger: BaseChunkLogger;

  public constructor(
    level: LoggerOptions["level"],
    MAX_LOG_SIZE_IN_BYTES: number = MAX_LOG_SIZE_IN_BYTES_DEFAULT,
  ) {
    this.baseChunkLogger = new BaseChunkLogger(level, MAX_LOG_SIZE_IN_BYTES);

    // if (typeof window !== 'undefined') {
    if (window) {
      // @ts-ignore
      window.downloadLogsBlob = (clientMetadata?: LogClientMetadata) => {
        this.downloadLogsBlobInBrowser(clientMetadata ?? { clientId: "N/A" });
        this.clearLogs();
      };
    }
  }

  public write(chunk: any): void {
    this.baseChunkLogger.appendToLogs(chunk);
  }

  public getLogs() {
    return this.baseChunkLogger.getLogs();
  }

  public clearLogs() {
    this.baseChunkLogger.clearLogs();
  }

  public getLogArray() {
    return this.baseChunkLogger.getLogArray();
  }

  public logsToBlob(extraMetadata: Record<string, string>) {
    return this.baseChunkLogger.logsToBlob(extraMetadata);
  }

  public downloadLogsBlobInBrowser(extraMetadata: Record<string, string>) {
    const url = URL.createObjectURL(this.logsToBlob(extraMetadata));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `w3i-logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }
}
