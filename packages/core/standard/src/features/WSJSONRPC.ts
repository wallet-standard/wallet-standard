import type { Client } from 'rpc-websockets';

/** TODO: docs */
export type WSJSONRPCClient = Pick<
    Client,
    | 'call'
    | 'close'
    | 'connect'
    | 'notify'
    | 'subscribe'
    | 'unsubscribe'
    // EventEmitter
    | 'off'
    | 'on'
    | 'once'
>;

/** TODO: docs */
export type WSJSONRPCFeature = Readonly<{
    /** Namespace for the feature. */
    WSJSONRPC: {
        /** TODO: docs */
        client: WSJSONRPCClient;
    };
}>;
