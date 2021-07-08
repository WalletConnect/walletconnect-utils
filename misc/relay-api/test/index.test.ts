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
} from '../src';

const TEST_SUBSCRIBE_REQUEST = {
  id: 1,
  jsonrpc: '2.0',
  method: 'bridge_subscribe',
  params: {
    topic: 'b6052f059b3bb31e9e76b1a8bc04a3f6d4e08579e518a482c566de15e0ca5c04',
  },
};

const TEST_PUBLISH_REQUEST = {
  id: 2,
  jsonrpc: '2.0',
  method: 'bridge_publish',
  params: {
    topic: 'b6052f059b3bb31e9e76b1a8bc04a3f6d4e08579e518a482c566de15e0ca5c04',
    message:
      '9e4637e0fe8cedafb9bf4d6eaf171e5e83682ee9f26754e4b586853435b0bb1ecded76f2054f567af5083b7f65b7ee2b8e6916b86ae4d0e72b7d9a89f3c90798d1206c0c3a44fb8eb23000a96087b8119275550b3f8a4bd9e3f6ad8151cad90ea90e5128a238ba387a9a03320b3c3081efed24efae409a9e2dc31b8251e4531f582f4b4f65f714ad2e99885952c3f2015b32f08aaa0967f8c9d2ccab113a166d68fc76bb1a111a64053dffc971afc194',
    ttl: 86400,
  },
};

const TEST_UNSUBSCRIBE_REQUEST = {
  id: 3,
  jsonrpc: '2.0',
  method: 'bridge_unsubscribe',
  params: {
    id: 'bd745387ddcc888f077157d1d4389fee2f28faf3fcb2b9b2993c114a1448bd32',
  },
};

const TEST_SUBSCRIPTION_REQUEST = {
  id: 4,
  jsonrpc: '2.0',
  method: 'bridge_subscription',
  params: {
    id: 'bd745387ddcc888f077157d1d4389fee2f28faf3fcb2b9b2993c114a1448bd32',
    data: {
      topic: 'b6052f059b3bb31e9e76b1a8bc04a3f6d4e08579e518a482c566de15e0ca5c04',
      message:
        '9e4637e0fe8cedafb9bf4d6eaf171e5e83682ee9f26754e4b586853435b0bb1ecded76f2054f567af5083b7f65b7ee2b8e6916b86ae4d0e72b7d9a89f3c90798d1206c0c3a44fb8eb23000a96087b8119275550b3f8a4bd9e3f6ad8151cad90ea90e5128a238ba387a9a03320b3c3081efed24efae409a9e2dc31b8251e4531f582f4b4f65f714ad2e99885952c3f2015b32f08aaa0967f8c9d2ccab113a166d68fc76bb1a111a64053dffc971afc194',
    },
  },
};

describe('Validators', () => {
  describe('request', () => {
    it('subscribe', async () => {
      expect(isSubscribeRequest(TEST_SUBSCRIBE_REQUEST)).toBeTruthy();
      expect(isSubscribeRequest(TEST_PUBLISH_REQUEST)).toBeFalsy();
      expect(isSubscribeRequest(TEST_UNSUBSCRIBE_REQUEST)).toBeFalsy();
      expect(isSubscribeRequest(TEST_SUBSCRIPTION_REQUEST)).toBeFalsy();
    });
    it('publish', async () => {
      expect(isPublishRequest(TEST_SUBSCRIBE_REQUEST)).toBeFalsy();
      expect(isPublishRequest(TEST_PUBLISH_REQUEST)).toBeTruthy();
      expect(isPublishRequest(TEST_UNSUBSCRIBE_REQUEST)).toBeFalsy();
      expect(isPublishRequest(TEST_SUBSCRIPTION_REQUEST)).toBeFalsy();
    });
    it('unsubscribe', async () => {
      expect(isUnsubscribeRequest(TEST_SUBSCRIBE_REQUEST)).toBeFalsy();
      expect(isUnsubscribeRequest(TEST_PUBLISH_REQUEST)).toBeFalsy();
      expect(isUnsubscribeRequest(TEST_UNSUBSCRIBE_REQUEST)).toBeTruthy();
      expect(isUnsubscribeRequest(TEST_SUBSCRIPTION_REQUEST)).toBeFalsy();
    });
    it('subscription', async () => {
      expect(isSubscriptionRequest(TEST_SUBSCRIBE_REQUEST)).toBeFalsy();
      expect(isSubscriptionRequest(TEST_PUBLISH_REQUEST)).toBeFalsy();
      expect(isSubscriptionRequest(TEST_UNSUBSCRIBE_REQUEST)).toBeFalsy();
      expect(isSubscriptionRequest(TEST_SUBSCRIPTION_REQUEST)).toBeTruthy();
    });
  });
  describe('method', () => {
    it('subscribe', async () => {
      expect(isSubscribeMethod(TEST_SUBSCRIBE_REQUEST.method)).toBeTruthy();
      expect(isSubscribeMethod(TEST_PUBLISH_REQUEST.method)).toBeFalsy();
      expect(isSubscribeMethod(TEST_UNSUBSCRIBE_REQUEST.method)).toBeFalsy();
      expect(isSubscribeMethod(TEST_SUBSCRIPTION_REQUEST.method)).toBeFalsy();
    });
    it('publish', async () => {
      expect(isPublishMethod(TEST_SUBSCRIBE_REQUEST.method)).toBeFalsy();
      expect(isPublishMethod(TEST_PUBLISH_REQUEST.method)).toBeTruthy();
      expect(isPublishMethod(TEST_UNSUBSCRIBE_REQUEST.method)).toBeFalsy();
      expect(isPublishMethod(TEST_SUBSCRIPTION_REQUEST.method)).toBeFalsy();
    });
    it('unsubscribe', async () => {
      expect(isUnsubscribeMethod(TEST_SUBSCRIBE_REQUEST.method)).toBeFalsy();
      expect(isUnsubscribeMethod(TEST_PUBLISH_REQUEST.method)).toBeFalsy();
      expect(isUnsubscribeMethod(TEST_UNSUBSCRIBE_REQUEST.method)).toBeTruthy();
      expect(isUnsubscribeMethod(TEST_SUBSCRIPTION_REQUEST.method)).toBeFalsy();
    });
    it('subscription', async () => {
      expect(isSubscriptionMethod(TEST_SUBSCRIBE_REQUEST.method)).toBeFalsy();
      expect(isSubscriptionMethod(TEST_PUBLISH_REQUEST.method)).toBeFalsy();
      expect(isSubscriptionMethod(TEST_UNSUBSCRIBE_REQUEST.method)).toBeFalsy();
      expect(
        isSubscriptionMethod(TEST_SUBSCRIPTION_REQUEST.method)
      ).toBeTruthy();
    });
  });
  describe('params', () => {
    it('subscribe', async () => {
      expect(isSubscribeParams(TEST_SUBSCRIBE_REQUEST.params)).toBeTruthy();
      expect(isSubscribeParams(TEST_PUBLISH_REQUEST.params)).toBeFalsy();
      expect(isSubscribeParams(TEST_UNSUBSCRIBE_REQUEST.params)).toBeFalsy();
      expect(isSubscribeParams(TEST_SUBSCRIPTION_REQUEST.params)).toBeFalsy();
    });
    it('publish', async () => {
      expect(isPublishParams(TEST_SUBSCRIBE_REQUEST.params)).toBeFalsy();
      expect(isPublishParams(TEST_PUBLISH_REQUEST.params)).toBeTruthy();
      expect(isPublishParams(TEST_UNSUBSCRIBE_REQUEST.params)).toBeFalsy();
      expect(isPublishParams(TEST_SUBSCRIPTION_REQUEST.params)).toBeFalsy();
    });
    it('unsubscribe', async () => {
      expect(isUnsubscribeParams(TEST_SUBSCRIBE_REQUEST.params)).toBeFalsy();
      expect(isUnsubscribeParams(TEST_PUBLISH_REQUEST.params)).toBeFalsy();
      expect(isUnsubscribeParams(TEST_UNSUBSCRIBE_REQUEST.params)).toBeTruthy();
      expect(isUnsubscribeParams(TEST_SUBSCRIPTION_REQUEST.params)).toBeFalsy();
    });
    it('subscription', async () => {
      expect(isSubscriptionParams(TEST_SUBSCRIBE_REQUEST.params)).toBeFalsy();
      expect(isSubscriptionParams(TEST_PUBLISH_REQUEST.params)).toBeFalsy();
      expect(isSubscriptionParams(TEST_UNSUBSCRIBE_REQUEST.params)).toBeFalsy();
      expect(
        isSubscriptionParams(TEST_SUBSCRIPTION_REQUEST.params)
      ).toBeTruthy();
    });
  });
});
