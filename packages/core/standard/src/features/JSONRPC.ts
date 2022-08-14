import type { Client } from 'jayson';

/** TODO: docs */
export type JSONRPCClient = Pick<
    Client,
    | 'request'
    // EventEmitter
    | 'on'
    | 'off'
    | 'once'
>;

/** TODO: docs */
export type JSONRPCFeature = Readonly<{
    /** Namespace for the feature. */
    JSONRPC: {
        /** TODO: docs */
        client: JSONRPCClient;
    };
}>;
