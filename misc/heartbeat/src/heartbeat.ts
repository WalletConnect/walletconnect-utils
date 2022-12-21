import { EventEmitter } from "events";
import { toMiliseconds } from "@walletconnect/time";

import { IHeartBeat, HeartBeatOptions } from "./types";

import { HEARTBEAT_INTERVAL, HEARTBEAT_EVENTS } from "./constants";

export class HeartBeat extends IHeartBeat {
  static async init(opts?: HeartBeatOptions) {
    const heartbeat = new HeartBeat(opts);
    await heartbeat.init();
    return heartbeat;
  }

  public events = new EventEmitter();

  public interval = HEARTBEAT_INTERVAL;
  private intervalRef?: number;

  constructor(opts?: HeartBeatOptions) {
    super(opts);
    this.interval = opts?.interval || HEARTBEAT_INTERVAL;
  }

  public async init(): Promise<void> {
    await this.initialize();
  }

  public stop(): void {
    clearInterval(this.intervalRef)
  }

  public on(event: string, listener: any): void {
    this.events.on(event, listener);
  }

  public once(event: string, listener: any): void {
    this.events.once(event, listener);
  }

  public off(event: string, listener: any): void {
    this.events.off(event, listener);
  }

  public removeListener(event: string, listener: any): void {
    this.events.removeListener(event, listener);
  }

  // ---------- Private ----------------------------------------------- //

  private async initialize(): Promise<any> {
    this.intervalRef = setInterval(() => this.pulse(), toMiliseconds(this.interval));
  }

  private pulse() {
    this.events.emit(HEARTBEAT_EVENTS.pulse);
  }
}
