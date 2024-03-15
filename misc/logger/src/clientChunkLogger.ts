import { MAX_LOG_SIZE_IN_BYTES_DEFAULT } from "./constants";
import { LogLinkedList } from "./linkedList";

export class ClientChunkLogger {
  private logs: LogLinkedList;
  private MAX_LOG_SIZE_IN_BYTES: number;

  public constructor(MAX_LOG_SIZE_IN_BYTES: number = MAX_LOG_SIZE_IN_BYTES_DEFAULT) {
    this.MAX_LOG_SIZE_IN_BYTES = MAX_LOG_SIZE_IN_BYTES;
    this.logs = new LogLinkedList();

    if (window) {
      // @ts-ignore
      window.w3iLogger = this;

      // @ts-ignore
      window.downloadLogsBlob = (clientMetadata?: LogClientMetadata) => {
        this.downloadLogsBlobInBrowser(clientMetadata ?? { clientId: "N/A" });
        this.clearLogs();
      };
    }
  }

  write(chunk: any): void {
    this.logs.append(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        log: chunk,
      }),
    );

    if (this.logs.size >= this.MAX_LOG_SIZE_IN_BYTES) {
      this.logs.shift();
    }
  }

  public getLogs() {
    return this.logs;
  }

  public clearLogs() {
    this.logs = new LogLinkedList();
  }

  public logsToBlob(extraMetadata: Record<string, string>) {
    this.logs.append(JSON.stringify({ extraMetadata }));
    const blob = new Blob(this.logs.toArray(), { type: "application/json" });
    return blob;
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
