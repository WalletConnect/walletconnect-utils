export type Direction = "forward" | "backward";

interface AuthenticationPayload {
  clientId: string;
}

interface RegisterParams {
  tags: string[];
  relayUrl: string;
}

interface GetMessagesParams {
  topic: string;
  originId: number;
  messageCount: number;
  direction: Direction;
}

export interface GetMessagesResponse {
  topic: string;
  direction: Direction;
  nextId: number;
  messages: string[];
}

export type RegisterPayload = RegisterParams & AuthenticationPayload;

export type GetMessagesPayload = GetMessagesParams & AuthenticationPayload;
