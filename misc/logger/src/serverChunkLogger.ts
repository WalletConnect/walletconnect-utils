import { MAX_LOG_SIZE_IN_BYTES_DEFAULT } from "./constants";
import { Writable } from "stream";
import { LogLinkedList } from "./linkedList";

export class ServerChunkLogger extends Writable {
  private logs: LogLinkedList;
  private MAX_LOG_SIZE_IN_BYTES: number;

  public constructor(MAX_LOG_SIZE_IN_BYTES: number = MAX_LOG_SIZE_IN_BYTES_DEFAULT) {
    super({ objectMode: true });

    this.MAX_LOG_SIZE_IN_BYTES = MAX_LOG_SIZE_IN_BYTES;
    this.logs = new LogLinkedList();
  }

  public _write(chunk: any): void {
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
}
