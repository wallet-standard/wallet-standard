import type { WalletAccount, WalletVersion1_0_0, WalletVersion1_1_0 } from '@wallet-standard/base';

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
export type StandardConnectFeature<V extends StandardConnectVersion = StandardConnectVersion1_0_0> = {
    /** Name of the feature. */
    readonly [StandardConnect]: {
        /** Version of the feature implemented by the Wallet. */
        readonly version: V;
        /** Method to call to use the feature. */
        readonly connect: StandardConnectMethod<V>;
    };
};
/**
 * @deprecated Use {@link StandardConnectFeature} instead.
 *
 * @group Deprecated
 */
export type ConnectFeature<V extends StandardConnectVersion = StandardConnectVersion1_0_0> = StandardConnectFeature<V>;

/**
 * Version of the {@link StandardConnectFeature} implemented by a {@link "@wallet-standard/base".Wallet}.
 *
 * @group Connect
 */
export type StandardConnectVersion = StandardConnectVersion1_0_0 | StandardConnectVersion1_1_0;

/**
 * Initial version of the {@link StandardConnectFeature}.
 *
 * @group Connect
 */
export type StandardConnectVersion1_0_0 = '1.0.0';

/**
 * Version of the {@link StandardConnectFeature} that supports filtering addresses, chains, and features, and supports HTTP/S URLs for account icons.
 *
 * @group Connect
 */
export type StandardConnectVersion1_1_0 = '1.1.0';

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
export type StandardConnectMethod<V extends StandardConnectVersion = StandardConnectVersion1_0_0> = (
    input?: StandardConnectInput<V>
) => Promise<StandardConnectOutput<V>>;
/**
 * @deprecated Use {@link StandardConnectMethod} instead.
 *
 * @group Deprecated
 */
export type ConnectMethod<V extends StandardConnectVersion = StandardConnectVersion1_0_0> = StandardConnectMethod<V>;

/**
 * Input for the {@link StandardConnectMethod}.
 *
 * @group Connect
 */
export type StandardConnectInput<V extends StandardConnectVersion = StandardConnectVersion1_0_0> = {
    /**
     * @deprecated
     *
     * This flag should not be used by the app, and it must have no effect on the Wallet's behavior.
     */
    readonly silent?: boolean;
} & V extends StandardConnectVersion1_1_0
    ? {
          /**
           * List of account {@link "@wallet-standard/base".WalletAccount.address addresses} that the app is requesting authorization to use.
           * If provided, the Wallet must return *only* accounts with *any* of the provided addresses.
           */
          readonly addresses?: WalletAccount<
              V extends StandardConnectVersion1_1_0 ? WalletVersion1_1_0 : WalletVersion1_0_0
          >['address'][];
          /**
           * List of account {@link "@wallet-standard/base".WalletAccount.chains chains} that the app is requesting authorization to use.
           * If provided, the Wallet must return *only* accounts with *any* of the provided chains.
           */
          readonly chains?: WalletAccount<
              V extends StandardConnectVersion1_1_0 ? WalletVersion1_1_0 : WalletVersion1_0_0
          >['chains'];
          /**
           * List of account {@link "@wallet-standard/base".WalletAccount.features features} that the app is requesting authorization to use.
           * If provided, the Wallet must return *only* accounts with *any* of the provided features.
           */
          readonly features?: WalletAccount<
              V extends StandardConnectVersion1_1_0 ? WalletVersion1_1_0 : WalletVersion1_0_0
          >['features'];
      }
    : Record<string, never>;

/**
 * @deprecated Use {@link StandardConnectInput} instead.
 *
 * @group Deprecated
 */
export type ConnectInput<V extends StandardConnectVersion = StandardConnectVersion1_0_0> = StandardConnectInput<V>;

/**
 * Output of the {@link StandardConnectMethod}.
 *
 * @group Connect
 */
export interface StandardConnectOutput<V extends StandardConnectVersion = StandardConnectVersion1_0_0> {
    /** List of accounts in the {@link "@wallet-standard/base".Wallet} that the app has been authorized to use. */
    readonly accounts: readonly WalletAccount<
        V extends StandardConnectVersion1_1_0 ? WalletVersion1_1_0 : WalletVersion1_0_0
    >[];
}
/**
 * @deprecated Use {@link StandardConnectOutput} instead.
 *
 * @group Deprecated
 */
export type ConnectOutput<V extends StandardConnectVersion = StandardConnectVersion1_0_0> = StandardConnectOutput<V>;
