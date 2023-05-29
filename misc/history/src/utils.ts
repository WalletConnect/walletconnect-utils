import { RegisterPayload, GetMessagesPayload, GetMessagesResponse } from "./types";
import fetch from "isomorphic-unfetch";
import type { ICore } from "@walletconnect/types";

export const DEFAULT_HISTORY_URL = "https://history.walletconnect.com";

export const DAY_IN_MS = 86400 * 1000;

export class HistoricalMessages {
  public constructor(private core: ICore, public messageResponse: GetMessagesResponse) {}

  public injectIntoRelayer() {
    for (const message in this.messageResponse.messages) {
      this.core.relayer.provider.events.emit("payload", message);
    }
  }
}

export class HistoryClient {
  private jwt = "";

  public constructor(private core: ICore, private readonly historyUrl = DEFAULT_HISTORY_URL) {}

  public async registerTags(payload: RegisterPayload, historyUrl = DEFAULT_HISTORY_URL) {
    try {
      await fetch(`${historyUrl}/register`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await this.getJwt()}`
        },
      });

    } catch (e) {
      throw new Error(`[HistoryClient] Failed to register tags: ${JSON.stringify(e)}`);
    }
  }

  public async getMessages(payload: GetMessagesPayload, historyUrl = DEFAULT_HISTORY_URL) {
    const entries = Object.entries(payload).map(([key, value]) => [key, value.toString()]);
    const params = new URLSearchParams(entries);

    try {
      const url = `${historyUrl}/messages?${params.toString()}`
      const rs: GetMessagesResponse = await (
        await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
      ).json();

      return new HistoricalMessages(this.core, rs);
    } catch (e) {
      throw new Error(`Failed to fetch messages` );
    }
  }

  public async getJwt() {
    if (this.jwt) return this.jwt;

    this.jwt = await this.core.crypto.signJWT(this.historyUrl);

    return this.jwt;
  }
}
