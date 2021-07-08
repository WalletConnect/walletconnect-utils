export interface TimestampInfo {
  started: number;
  elapsed?: number;
}

export abstract class ITimestamp {
  public abstract timestamps: Map<string, TimestampInfo>;

  public abstract start(label: string): void;

  public abstract stop(label: string): void;

  public abstract get(label: string): TimestampInfo;

  public abstract elapsed(label: string): number;
}
