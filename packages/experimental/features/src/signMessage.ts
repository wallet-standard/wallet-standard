import type { ReadonlyUint8Array, WalletAccount } from '@wallet-standard/base';

/** TODO: docs */
export type SignMessageFeature = {
    /** Name of the feature. */
    'experimental:signMessage': {
        /** Version of the feature implemented by the {@link "@wallet-standard/base".Wallet}. */
        version: SignMessageVersion;

        /** Sign messages (arbitrary bytes) using the account's secret key. */
        signMessage: SignMessageMethod;
    };
};

/** TODO: docs */
export type SignMessageVersion = '1.0.0';

/** TODO: docs */
export type SignMessageMethod = (...inputs: SignMessageInput[]) => Promise<SignMessageOutput[]>;

/** Input for signing a message. */
export interface SignMessageInput {
    /** Account to use. */
    account: WalletAccount;

    /** Message to sign, as raw bytes. */
    message: ReadonlyUint8Array;
}

/** Output of signing a message. */
export interface SignMessageOutput {
    /** TODO: docs */
    signedMessage: Uint8Array;

    /** TODO: docs */
    signature: Uint8Array;
}
