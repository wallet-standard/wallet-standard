import type { WalletAccount } from '@wallet-standard/base';

/**
 * `standard:connect` is a {@link "@wallet-standard/base".Wallet.features | feature} that may be implemented by a
 * {@link "@wallet-standard/base".Wallet} to allow the app to obtain authorization to use
 * {@link "@wallet-standard/base".Wallet.accounts}.
 *
 * @group Connect
 */
export type ConnectFeature = {
    /** Name of the feature. */
    readonly 'standard:connect': {
        /** Version of the feature implemented by the Wallet. */
        readonly version: ConnectVersion;
        /** Method to call to use the feature. */
        readonly connect: ConnectMethod;
    };
};

/**
 * Version of the {@link ConnectFeature} implemented by a {@link "@wallet-standard/base".Wallet}.
 *
 * @group Connect
 */
export type ConnectVersion = '1.0.0';

/**
 * Method to call to use the {@link ConnectFeature}.
 *
 * @group Connect
 */
export type ConnectMethod = (input?: ConnectInput) => Promise<ConnectOutput>;

/**
 * Input for the {@link ConnectMethod}.
 *
 * @group Connect
 */
export interface ConnectInput {
    /**
     * By default, using the {@link ConnectFeature} should prompt the user to request authorization to accounts.
     * Set the `silent` flag to `true` to request accounts that have already been authorized without prompting.
     *
     * This flag may or may not be used by the Wallet and the app should not depend on it being used.
     * If this flag is used by the Wallet, the Wallet should not prompt the user, and should return only the accounts
     * that the app is authorized to use.
     */
    readonly silent?: boolean;
}

/**
 * Output of the {@link ConnectMethod}.
 *
 * @group Connect
 */
export interface ConnectOutput {
    /** List of accounts in the {@link "@wallet-standard/base".Wallet} that the app has been authorized to use. */
    readonly accounts: readonly WalletAccount[];
}
