import type { AsyncMapFunction } from '@wallet-standard/types';

// Instantiation expression -- https://github.com/microsoft/TypeScript/pull/47607
declare const signMessageMethod: AsyncMapFunction<SignMessageInput, SignMessageOutput>;

/** TODO: docs */
export type SignMessageMethod = typeof signMessageMethod;

/** TODO: docs */
export type SignMessageFeature = Readonly<{
    /** Namespace for the feature. */
    signMessage: {
        /** Sign messages (arbitrary bytes) using the account's secret key. */
        signMessage: SignMessageMethod;
    };
}>;

/** Input for signing a message. */
export type SignMessageInput = Readonly<{
    /** Message to sign, as raw bytes. */
    message: Uint8Array;
}>;

/** Output of signing a message. */
export type SignMessageOutput = Readonly<{
    /** TODO: docs */
    signedMessage: Uint8Array;

    /** TODO: docs */
    signature: Uint8Array;
}>;
