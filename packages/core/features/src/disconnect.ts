/**
 * `standard:disconnect` is a {@link "@wallet-standard/base".Wallet.features | feature} that may be implemented by a
 * {@link "@wallet-standard/base".Wallet} to allow the app to perform any cleanup work.
 *
 * This feature may or may not be used by the app and the Wallet should not depend on it being used.
 * If this feature is used by the app, the Wallet should perform any cleanup work, but should not revoke authorization
 * to use accounts previously granted through the {@link ConnectFeature}.
 *
 * @group Disconnect
 */
export type DisconnectFeature = {
    /** Name of the feature. */
    readonly 'standard:disconnect': {
        /** Version of the feature implemented by the Wallet. */
        readonly version: DisconnectVersion;
        /** Method to call to use the feature. */
        readonly disconnect: DisconnectMethod;
    };
};

/**
 * Version of the {@link DisconnectFeature} implemented by a Wallet.
 *
 * @group Disconnect
 */
export type DisconnectVersion = '1.0.0';

/**
 * Method to call to use the {@link DisconnectFeature}.
 *
 * @group Disconnect
 */
export type DisconnectMethod = () => Promise<void>;
