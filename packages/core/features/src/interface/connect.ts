import type { WalletAccount, WalletInterface } from '@wallet-standard/standard';

/**
 * Connect to accounts in the wallet.
 *
 * @param input Input for connecting.
 *
 * @return Output of connecting.
 */
export type ConnectMethod<I extends WalletInterface> = (input?: ConnectInput<I>) => Promise<ConnectOutput<I>>;

/** TODO: docs */
export type ConnectFeature<I extends WalletInterface> = {
    /** Namespace for the feature. */
    connect: {
        /** Version of the feature API. */
        version: '1.0.0';

        /** Sign messages (arbitrary bytes) using the account's secret key. */
        connect: ConnectMethod<I>;
    };
};

/** Input for connecting. */
export type ConnectInput<I extends WalletInterface> = {
    /**
     * Set to true to request the authorized accounts without prompting the user.
     * The wallet should return only the accounts that the app is already authorized to connect to.
     */
    silent?: boolean;

    /** TODO: docs */
    chains?: ReadonlyArray<string>;

    /** TODO: docs */
    features?: ReadonlyArray<string>;

    /** TODO: docs */
    extensions?: ReadonlyArray<string>;
};

/** Output of connecting. */
export type ConnectOutput<I extends WalletInterface> = {
    /** List of accounts in the wallet that the app has been authorized to use. */
    accounts: I['accounts'];
};
