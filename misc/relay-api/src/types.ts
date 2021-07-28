export declare namespace RelayJsonRpc {
  export interface Methods {
    info: string;
    connect: string;
    disconnect: string;
    publish: string;
    subscribe: string;
    subscription: string;
    unsubscribe: string;
  }

  export interface SubscribeParams {
    topic: string;
  }

  export interface PublishParams {
    topic: string;
    message: string;
    ttl: number;
  }

  export interface SubscriptionData {
    topic: string;
    message: string;
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
