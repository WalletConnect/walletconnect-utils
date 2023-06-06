export type Direction = "forward" | "backward";

export interface RegisterPayload {
  tags: string[];
  relayUrl: string;
}

export interface GetMessagesPayload {
  topic: string;
  originId?: number;
  messageCount?: number;
  direction?: Direction;
}

export interface Message {
  message: string;
  method: string;
  topic: string;
  message_id: string;
  client_id: string;
}

export interface GetMessagesResponse {
  topic: string;
  direction: Direction;
  nextId: number;
  messages: Message[];
}
