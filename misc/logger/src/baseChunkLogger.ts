import { MAX_LOG_SIZE_IN_BYTES_DEFAULT } from "./constants";
import { LogLinkedList } from "./linkedList";
import type { LoggerOptions } from 'pino'
import { levels } from 'pino'

export default class BaseChunkLogger {
  private logs: LogLinkedList;
  private MAX_LOG_SIZE_IN_BYTES: number;
  private level: LoggerOptions['level']
  private levelValue: number;

  public constructor(level: LoggerOptions['level'], MAX_LOG_SIZE_IN_BYTES: number = MAX_LOG_SIZE_IN_BYTES_DEFAULT) {
    this.level = level ?? 'error';
    this.levelValue = levels.values[this.level];

    this.MAX_LOG_SIZE_IN_BYTES = MAX_LOG_SIZE_IN_BYTES;
    this.logs = new LogLinkedList();
  }

  public forwardToConsole(chunk: any) {
    if(chunk.level === levels.values['error']) {
      console.error(chunk)
    }
    else if (chunk.level === levels.values['warn']) {
      console.warn(chunk)
    }
    else {
      console.log(chunk)
    }
  }

  public appendToLogs(chunk: any) {
    this.logs.append(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        log: chunk,
      }),
    );

    // Based on https://github.com/pinojs/pino/blob/master/lib/constants.js
    if(chunk.level >= this.levelValue) {
      this.forwardToConsole(chunk)
    }

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

  public getLogArray() {
    return this.logs.toArray()
  }

  public logsToBlob(extraMetadata: Record<string, string>) {
    this.logs.append(JSON.stringify({ extraMetadata }));
    const blob = new Blob(this.logs.toArray(), { type: "application/json" });
    return blob;
  }


}
