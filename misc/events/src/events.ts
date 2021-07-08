import { EventEmitter } from "events";

export abstract class IEvents {
  public abstract events: EventEmitter;

  // events
  public abstract on(event: string, listener: any): void;
  public abstract once(event: string, listener: any): void;
  public abstract off(event: string, listener: any): void;
  public abstract removeListener(event: string, listener: any): void;
}
