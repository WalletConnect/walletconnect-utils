import { RegisterPayload, GetMessagesPayload } from "./types";
import fetch from "isomorphic-unfetch";
import jsonwebtoken from "jsonwebtoken";

export const DEFAULT_HISTORY_URL = "https://history.walletconnect.com";

export const DAY_IN_MS = 86400 * 1000;

const generateJWT = (clientId: string, url: string) => {
  const iat = new Date();
  const jwt = jsonwebtoken.sign(
    {
      iss: clientId,
      aud: url,
      sub: "",
      iat: iat.toISOString(),
      exp: new Date(iat.getTime() + DAY_IN_MS).toISOString(),
    },
    "",
  );

  return jwt;
};

export const registerTags = async (payload: RegisterPayload, historyUrl = DEFAULT_HISTORY_URL) => {
  const jwt = generateJWT(payload.clientId, historyUrl);

  try {
    await fetch(historyUrl, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        Authorization: jwt,
      },
    });
  } catch (e) {
    throw new Error("Failed to register tags");
  }
};

export const getMessages = async (
  payload: GetMessagesPayload,
  historyUrl = DEFAULT_HISTORY_URL,
) => {
  const jwt = generateJWT(payload.clientId, historyUrl);

  const entries = Object.entries(payload).map(([key, value]) => [key, value.toString()]);
  const params = new URLSearchParams(entries);

  try {
    await fetch(`${historyUrl}?${params.toString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: jwt,
      },
    });
  } catch (e) {
    throw new Error("Failed to fetch messages");
  }
};
