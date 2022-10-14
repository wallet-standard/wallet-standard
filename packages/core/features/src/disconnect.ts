/**
 * The disconnect feature is an optional feature that may be implemented by
 * wallets to perform any cleanup-related work.
 * This feature may not be invoked by dapps and should not be depended on.
 * This feature should not remove any permissions previously granted through ConnectFeature.
 */
export type DisconnectFeature = {
    /** Namespace for the feature. */
    'standard:disconnect': {
        /** Version of the feature API. */
        version: DisconnectVersion;

        /**
         * Disconnect from the wallet.
         */
        disconnect: DisconnectMethod;
    };
};

/** TODO: docs */
export type DisconnectVersion = '1.0.0';

/** TODO: docs */
export type DisconnectMethod = () => Promise<void>;
