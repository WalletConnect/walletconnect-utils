export declare namespace RelayJsonRpc {
  export interface Methods {
    publish: string;
    batchPublish: string;
    subscribe: string;
    batchSubscribe: string;
    subscription: string;
    unsubscribe: string;
    batchUnsubscribe: string;
  }

  export interface SubscribeParams {
    topic: string;
  }

  export interface BatchSubscribeParams {
    topics: string[];
  }

  export interface BatchUnsubscribeParams {
    subscriptions: UnsubscribeParams[];
  }

  export interface PublishParams {
    topic: string;
    message: string;
    ttl: number;
    prompt?: boolean;
    tag?: number;
  }

  export interface BatchPublishParams {
    messages: PublishParams[];
  }

  export interface SubscriptionData {
    topic: string;
    message: string;
    publishedAt: number;
  }

  export interface SubscriptionParams {
    id: string;
    data: SubscriptionData;
  }

  export interface UnsubscribeParams {
    id: string;
    topic: string;
  }
}
