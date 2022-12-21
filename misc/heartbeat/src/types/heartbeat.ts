import { IEvents } from "@walletconnect/events";

export interface HeartBeatOptions {
  interval?: number; // in seconds
}

export abstract class IHeartBeat extends IEvents {
  public abstract interval: number;

  constructor(opts?: HeartBeatOptions) {
    super();
  }

  public abstract init(): Promise<void>;
  public abstract stop(): void;
}
