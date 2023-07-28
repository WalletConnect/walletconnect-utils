import { Core, RELAYER_EVENTS } from "@walletconnect/core";
import * as chai from "chai";
import { hashMessage } from "@walletconnect/utils";
import { ICore, RelayerTypes } from "@walletconnect/types";
import { isJsonRpcRequest, JsonRpcRequest } from "@walletconnect/jsonrpc-utils";
import { HistoryClient } from "../";

const waitForEvent = async (checkForEvent: (...args: any[]) => Promise<boolean>) => {
  await new Promise((resolve) => {
    const intervalId = setInterval(async () => {
      if (await checkForEvent()) {
        clearInterval(intervalId);
        resolve({});
      }
    }, 100);
  });
};

const wait = async (time: number) => {
  return new Promise<void>((resolve) => {
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
  await waitForEvent(() => Promise.resolve(core1.relayer.subscriber.subscriptions.size > 0));

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
    return Promise.resolve(core1.history.values.length === decodedPayloads.length);
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
    await core2.history.init();
    await core2.crypto.init();
    await core2.relayer.init();

    const historyClient = new HistoryClient(core1);
    await historyClient.registerTags({
      relayUrl: "wss://relay.walletconnect.com",
      tags: ["7000"],
    });
  });

  describe("Flow", () => {
    //@ts-ignore
    this.timeout = 20000;
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
      await historyClient.registerTags({
        relayUrl: "wss://relay.walletconnect.com",
        tags: ["7000"],
      });

      await wait(6000);

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
      await waitForEvent(async () => {
        const historicalMessages = await historyClient.getMessages({
          topic,
          direction: "backward",
        });

        return historicalMessages.messageResponse.messages.length > 0;
      });

      const historicalMessages = await historyClient.getMessages({
        topic,
        direction: "backward",
      });

      chai.expect(historicalMessages.messageResponse.messages.length).to.gt(1);
    });

    it("Can inject messages", async () => {
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

      const history = new HistoryClient(core2);
      await history.registerTags({
        tags: ["7000"],
        relayUrl: "wss://relay.walletconnect.com",
      });

      await wait(2000);

      core2.history.delete(topic);
      await core2.relayer.messages.del(topic);

      let sum = 0;
      core2.relayer.on(RELAYER_EVENTS.message, async message => {
        const decoded = await core2.crypto.decode(topic, message.message);
        if (isJsonRpcRequest(decoded)) {
          sum += decoded.params.thing;
        }
      });

      const messages = await history.getMessages({ topic });

      await messages.injectIntoRelayer();

      await wait(10000);

      chai.expect(sum).to.gt(4);
    });
  });
});
