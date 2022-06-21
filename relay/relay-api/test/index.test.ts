import "mocha";
import * as chai from "chai";

import {
  isSubscribeRequest,
  isPublishRequest,
  isUnsubscribeRequest,
  isSubscriptionRequest,
  isSubscribeMethod,
  isPublishMethod,
  isUnsubscribeMethod,
  isSubscriptionMethod,
  isSubscribeParams,
  isPublishParams,
  isUnsubscribeParams,
  isSubscriptionParams,
} from "../src";

const TEST_SUBSCRIBE_REQUEST = {
  id: 1,
  jsonrpc: "2.0",
  method: "bridge_subscribe",
  params: {
    topic: "b6052f059b3bb31e9e76b1a8bc04a3f6d4e08579e518a482c566de15e0ca5c04",
  },
};

const TEST_PUBLISH_REQUEST = {
  id: 2,
  jsonrpc: "2.0",
  method: "bridge_publish",
  params: {
    topic: "b6052f059b3bb31e9e76b1a8bc04a3f6d4e08579e518a482c566de15e0ca5c04",
    message:
      "9e4637e0fe8cedafb9bf4d6eaf171e5e83682ee9f26754e4b586853435b0bb1ecded76f2054f567af5083b7f65b7ee2b8e6916b86ae4d0e72b7d9a89f3c90798d1206c0c3a44fb8eb23000a96087b8119275550b3f8a4bd9e3f6ad8151cad90ea90e5128a238ba387a9a03320b3c3081efed24efae409a9e2dc31b8251e4531f582f4b4f65f714ad2e99885952c3f2015b32f08aaa0967f8c9d2ccab113a166d68fc76bb1a111a64053dffc971afc194",
    ttl: 86400,
  },
};

const TEST_UNSUBSCRIBE_REQUEST = {
  id: 3,
  jsonrpc: "2.0",
  method: "bridge_unsubscribe",
  params: {
    id: "bd745387ddcc888f077157d1d4389fee2f28faf3fcb2b9b2993c114a1448bd32",
    topic: "b6052f059b3bb31e9e76b1a8bc04a3f6d4e08579e518a482c566de15e0ca5c04",
  },
};

const TEST_SUBSCRIPTION_REQUEST = {
  id: 4,
  jsonrpc: "2.0",
  method: "bridge_subscription",
  params: {
    id: "bd745387ddcc888f077157d1d4389fee2f28faf3fcb2b9b2993c114a1448bd32",
    data: {
      topic: "b6052f059b3bb31e9e76b1a8bc04a3f6d4e08579e518a482c566de15e0ca5c04",
      message:
        "9e4637e0fe8cedafb9bf4d6eaf171e5e83682ee9f26754e4b586853435b0bb1ecded76f2054f567af5083b7f65b7ee2b8e6916b86ae4d0e72b7d9a89f3c90798d1206c0c3a44fb8eb23000a96087b8119275550b3f8a4bd9e3f6ad8151cad90ea90e5128a238ba387a9a03320b3c3081efed24efae409a9e2dc31b8251e4531f582f4b4f65f714ad2e99885952c3f2015b32f08aaa0967f8c9d2ccab113a166d68fc76bb1a111a64053dffc971afc194",
    },
  },
};

describe("Validators", () => {
  describe("request", () => {
    it("subscribe", async () => {
      chai.expect(isSubscribeRequest(TEST_SUBSCRIBE_REQUEST)).to.be.true;
      chai.expect(isSubscribeRequest(TEST_PUBLISH_REQUEST)).to.be.false;
      chai.expect(isSubscribeRequest(TEST_UNSUBSCRIBE_REQUEST)).to.be.false;
      chai.expect(isSubscribeRequest(TEST_SUBSCRIPTION_REQUEST)).to.be.false;
    });
    it("publish", async () => {
      chai.expect(isPublishRequest(TEST_SUBSCRIBE_REQUEST)).to.be.false;
      chai.expect(isPublishRequest(TEST_PUBLISH_REQUEST)).to.be.true;
      chai.expect(isPublishRequest(TEST_UNSUBSCRIBE_REQUEST)).to.be.false;
      chai.expect(isPublishRequest(TEST_SUBSCRIPTION_REQUEST)).to.be.false;
    });
    it("unsubscribe", async () => {
      chai.expect(isUnsubscribeRequest(TEST_SUBSCRIBE_REQUEST)).to.be.false;
      chai.expect(isUnsubscribeRequest(TEST_PUBLISH_REQUEST)).to.be.false;
      chai.expect(isUnsubscribeRequest(TEST_UNSUBSCRIBE_REQUEST)).to.be.true;
      chai.expect(isUnsubscribeRequest(TEST_SUBSCRIPTION_REQUEST)).to.be.false;
    });
    it("subscription", async () => {
      chai.expect(isSubscriptionRequest(TEST_SUBSCRIBE_REQUEST)).to.be.false;
      chai.expect(isSubscriptionRequest(TEST_PUBLISH_REQUEST)).to.be.false;
      chai.expect(isSubscriptionRequest(TEST_UNSUBSCRIBE_REQUEST)).to.be.false;
      chai.expect(isSubscriptionRequest(TEST_SUBSCRIPTION_REQUEST)).to.be.true;
    });
  });
  describe("method", () => {
    it("subscribe", async () => {
      chai.expect(isSubscribeMethod(TEST_SUBSCRIBE_REQUEST.method)).to.be.true;
      chai.expect(isSubscribeMethod(TEST_PUBLISH_REQUEST.method)).to.be.false;
      chai.expect(isSubscribeMethod(TEST_UNSUBSCRIBE_REQUEST.method)).to.be
        .false;
      chai.expect(isSubscribeMethod(TEST_SUBSCRIPTION_REQUEST.method)).to.be
        .false;
    });
    it("publish", async () => {
      chai.expect(isPublishMethod(TEST_SUBSCRIBE_REQUEST.method)).to.be.false;
      chai.expect(isPublishMethod(TEST_PUBLISH_REQUEST.method)).to.be.true;
      chai.expect(isPublishMethod(TEST_UNSUBSCRIBE_REQUEST.method)).to.be.false;
      chai.expect(isPublishMethod(TEST_SUBSCRIPTION_REQUEST.method)).to.be
        .false;
    });
    it("unsubscribe", async () => {
      chai.expect(isUnsubscribeMethod(TEST_SUBSCRIBE_REQUEST.method)).to.be
        .false;
      chai.expect(isUnsubscribeMethod(TEST_PUBLISH_REQUEST.method)).to.be.false;
      chai.expect(isUnsubscribeMethod(TEST_UNSUBSCRIBE_REQUEST.method)).to.be
        .true;
      chai.expect(isUnsubscribeMethod(TEST_SUBSCRIPTION_REQUEST.method)).to.be
        .false;
    });
    it("subscription", async () => {
      chai.expect(isSubscriptionMethod(TEST_SUBSCRIBE_REQUEST.method)).to.be
        .false;
      chai.expect(isSubscriptionMethod(TEST_PUBLISH_REQUEST.method)).to.be
        .false;
      chai.expect(isSubscriptionMethod(TEST_UNSUBSCRIBE_REQUEST.method)).to.be
        .false;
      chai.expect(isSubscriptionMethod(TEST_SUBSCRIPTION_REQUEST.method)).to.be
        .true;
    });
  });
  describe("params", () => {
    it("subscribe", async () => {
      chai.expect(isSubscribeParams(TEST_SUBSCRIBE_REQUEST.params)).to.be.true;
      chai.expect(isSubscribeParams(TEST_PUBLISH_REQUEST.params)).to.be.false;
      chai.expect(isSubscribeParams(TEST_UNSUBSCRIBE_REQUEST.params)).to.be
        .false;
      chai.expect(isSubscribeParams(TEST_SUBSCRIPTION_REQUEST.params)).to.be
        .false;
    });
    it("publish", async () => {
      chai.expect(isPublishParams(TEST_SUBSCRIBE_REQUEST.params)).to.be.false;
      chai.expect(isPublishParams(TEST_PUBLISH_REQUEST.params)).to.be.true;
      chai.expect(isPublishParams(TEST_UNSUBSCRIBE_REQUEST.params)).to.be.false;
      chai.expect(isPublishParams(TEST_SUBSCRIPTION_REQUEST.params)).to.be
        .false;
    });
    it("unsubscribe", async () => {
      chai.expect(isUnsubscribeParams(TEST_SUBSCRIBE_REQUEST.params)).to.be
        .false;
      chai.expect(isUnsubscribeParams(TEST_PUBLISH_REQUEST.params)).to.be.false;
      chai.expect(isUnsubscribeParams(TEST_UNSUBSCRIBE_REQUEST.params)).to.be
        .true;
      chai.expect(isUnsubscribeParams(TEST_SUBSCRIPTION_REQUEST.params)).to.be
        .false;
    });
    it("subscription", async () => {
      chai.expect(isSubscriptionParams(TEST_SUBSCRIBE_REQUEST.params)).to.be
        .false;
      chai.expect(isSubscriptionParams(TEST_PUBLISH_REQUEST.params)).to.be
        .false;
      chai.expect(isSubscriptionParams(TEST_UNSUBSCRIBE_REQUEST.params)).to.be
        .false;
      chai.expect(isSubscriptionParams(TEST_SUBSCRIPTION_REQUEST.params)).to.be
        .true;
    });
  });
});
