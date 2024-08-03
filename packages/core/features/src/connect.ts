import type { WalletAccount } from '@wallet-standard/base';

/** Name of the feature. */
export const StandardConnect = 'standard:connect';
/**
 * @deprecated Use {@link StandardConnect} instead.
 *
 * @group Deprecated
 */
export const Connect = StandardConnect;

/**
 * `standard:connect` is a {@link "@wallet-standard/base".Wallet.features | feature} that may be implemented by a
 * {@link "@wallet-standard/base".Wallet} to allow the app to obtain authorization to use
 * {@link "@wallet-standard/base".Wallet.accounts}.
 *
 * @group Connect
 */
export type StandardConnectFeature = {
    /** Name of the feature. */
    readonly [StandardConnect]: {
        /** Version of the feature implemented by the Wallet. */
        readonly version: StandardConnectVersion;
        /** Method to call to use the feature. */
        readonly connect: StandardConnectMethod;
    };
};
/**
 * @deprecated Use {@link StandardConnectFeature} instead.
 *
 * @group Deprecated
 */
export type ConnectFeature = StandardConnectFeature;

/**
 * Version of the {@link StandardConnectFeature} implemented by a {@link "@wallet-standard/base".Wallet}.
 *
 * @group Connect
 */
export type StandardConnectVersion = '1.1.0';
/**
 * @deprecated Use {@link StandardConnectVersion} instead.
 *
 * @group Deprecated
 */
export type ConnectVersion = StandardConnectVersion;

/**
 * Method to call to use the {@link StandardConnectFeature}.
 *
 * @group Connect
 */
export type StandardConnectMethod = (input?: StandardConnectInput) => Promise<StandardConnectOutput>;
/**
 * @deprecated Use {@link StandardConnectMethod} instead.
 *
 * @group Deprecated
 */
export type ConnectMethod = StandardConnectMethod;

/**
 * Input for the {@link StandardConnectMethod}.
 *
 * @group Connect
 */
export interface StandardConnectInput {
    /**
     * List of account {@link "@wallet-standard/base".WalletAccount.address addresses} that the app is requesting authorization to use.
     * If provided, the Wallet must return *only* accounts with *any* of the provided addresses.
     */
    readonly addresses?: WalletAccount['address'][];
    /**
     * List of account {@link "@wallet-standard/base".WalletAccount.chains chains} that the app is requesting authorization to use.
     * If provided, the Wallet must return *only* accounts with *any* of the provided chains.
     */
    readonly chains?: WalletAccount['chains'];
    /**
     * List of account {@link "@wallet-standard/base".WalletAccount.features features} that the app is requesting authorization to use.
     * If provided, the Wallet must return *only* accounts with *any* of the provided features.
     */
    readonly features?: WalletAccount['features'];
    /**
     * @deprecated
     *
     * This flag should not be used by the app, and it must have no effect on the Wallet's behavior.
     */
    readonly silent?: boolean;
}
/**
 * @deprecated Use {@link StandardConnectInput} instead.
 *
 * @group Deprecated
 */
export type ConnectInput = StandardConnectInput;

/**
 * Output of the {@link StandardConnectMethod}.
 *
 * @group Connect
 */
export interface StandardConnectOutput {
    /** List of accounts in the {@link "@wallet-standard/base".Wallet} that the app has been authorized to use. */
    readonly accounts: readonly WalletAccount[];
}
/**
 * @deprecated Use {@link StandardConnectOutput} instead.
 *
 * @group Deprecated
 */
export type ConnectOutput = StandardConnectOutput;
