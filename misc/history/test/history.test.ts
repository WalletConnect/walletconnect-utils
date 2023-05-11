import { Core, RELAYER_EVENTS } from "@walletconnect/core";
import * as chai from "chai";
import { hashMessage } from "@walletconnect/utils";
import { ICore, RelayerTypes } from "@walletconnect/types";
import { isJsonRpcRequest, JsonRpcRequest } from "@walletconnect/jsonrpc-utils";
import { HistoryClient } from "../";

const waitForEvent = async (checkForEvent: (...args: any[]) => boolean) => {
  await new Promise(resolve => {
    const intervalId = setInterval(() => {
      if (checkForEvent()) {
        clearInterval(intervalId);
        resolve({});
      }
    }, 100);
  });
};

const wait = async (time: number) => {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

const basicSendMessageFlow = async (
  core1: ICore,
  core2: ICore,
  decodedPayloads: JsonRpcRequest<any>[],
  tag: number,
) => {
  const pubkey1 = await core1.crypto.generateKeyPair();
  const pubkey2 = await core2.crypto.generateKeyPair();
  const symKey = await core1.crypto.generateSharedKey(pubkey1, pubkey2);

  const topic = hashMessage(symKey);
  await core1.crypto.setSymKey(symKey, topic);
  await core2.crypto.setSymKey(symKey, topic);

  await core1.relayer.subscribe(topic);
  await waitForEvent(() => core1.relayer.subscriber.subscriptions.size > 0);

  core1.relayer.on(RELAYER_EVENTS.message, async (event: RelayerTypes.MessageEvent) => {
    const payload = await core1.crypto.decode(topic, event.message);
    if (isJsonRpcRequest(payload)) {
      core1.history.set(event.topic, payload);
    }
  });

  for (const decodedPayload of decodedPayloads) {
    const payload = await core2.crypto.encode(topic, decodedPayload);

    await core2.relayer.publish(topic, payload, {
      ttl: 3000,
      tag: tag,
    });
  }

  await waitForEvent(() => {
    return core1.history.values.length === decodedPayloads.length;
  });

  chai.expect(core1.history.values.length).to.eq(decodedPayloads.length);

  return [topic];
};

describe("utils/history", () => {
  let core1 = new Core({
    projectId: process.env.TEST_PROJECT_ID,
    relayUrl: "wss://relay.walletconnect.com",
  });
  let core2 = new Core({
    projectId: process.env.TEST_PROJECT_ID,
    relayUrl: "wss://relay.walletconnect.com",
  });

  beforeEach(async () => {
    core1 = new Core({
      projectId: process.env.TEST_PROJECT_ID,
      relayUrl: "wss://relay.walletconnect.com",
    });
    core2 = new Core({
      projectId: process.env.TEST_PROJECT_ID,
      relayUrl: "wss://relay.walletconnect.com",
    });
    await core1.crypto.init();
    await core1.history.init();
    await core1.relayer.init();
    await core2.crypto.init();
    await core2.relayer.init();

    const historyClient = new HistoryClient(core1);
    await historyClient.registerTags({
      relayUrl: "wss://relay.walletconnect.com",
      tags: ["7000"],
    });
  });

  describe("Flow", () => {
    it("Sends a message", async () => {
      await basicSendMessageFlow(
        core1,
        core2,
        [
          {
            id: Date.now(),
            jsonrpc: "2.0",
            method: "test_method",
            params: {},
          },
        ],
        7000,
      );
    });

    it("Can register tags", async () => {
      const historyClient = new HistoryClient(core1);
      await historyClient.registerTags({
        relayUrl: "wss://relay.walletconnect.com",
        tags: ["7000"],
      });
    });

    it("Can retrieve tagged messages", async () => {
      const historyClient = new HistoryClient(core1);

      await wait(1000);

      const [topic] = await basicSendMessageFlow(
        core1,
        core2,
        [
          {
            jsonrpc: "2.0",
            id: Date.now(),
            method: "test_message",
            params: { thing: 1 },
          },
          {
            jsonrpc: "2.0",
            id: Date.now() + 1000,
            method: "test_message",
            params: { thing: 2 },
          },
          {
            jsonrpc: "2.0",
            id: Date.now() + 2000,
            method: "test_message",
            params: { thing: 3 },
          },
        ],
        7000,
      );

      console.log({ topic });

      await wait(2000);

      const historicalMessages = await historyClient.getMessages({
        topic,
        direction: "backward",
      });

      chai.expect(historicalMessages.messageResponse.messages.length).to.eq(1);
    }, 10000);
  });
});
