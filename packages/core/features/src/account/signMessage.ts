import type { WalletAccount } from '@wallet-standard/standard';
import type { AsyncMapFunction } from '@wallet-standard/types';

/** TODO: docs */
export type SignMessageMethod<A extends WalletAccount> = AsyncMapFunction<SignMessageInput<A>, SignMessageOutput<A>>;

/** TODO: docs */
export type SignMessageFeature<A extends WalletAccount> = {
    /** Namespace for the feature. */
    signMessage: {
        /** Version of the feature API. */
        version: '1.0.0';

        /** Sign messages (arbitrary bytes) using the account's secret key. */
        signMessage: SignMessageMethod<A>;
    };
};

/** Input for signing a message. */
export type SignMessageInput<A extends WalletAccount> = {
    /** Message to sign, as raw bytes. */
    message: Uint8Array;
};

/** Output of signing a message. */
export type SignMessageOutput<A extends WalletAccount> = {
    /** TODO: docs */
    signedMessage: Uint8Array;

    /** TODO: docs */
    signature: Uint8Array;
};
