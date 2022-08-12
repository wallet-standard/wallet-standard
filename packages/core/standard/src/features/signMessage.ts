import type { AsyncMapFunction } from '@wallet-standard/types';

/** TODO: docs */
export type SignMessageFeature = Readonly<{
    signMessage: {
        /**
         * Sign messages (arbitrary bytes) using the account's secret key.
         *
         * @param inputs Inputs for signing messages.
         *
         * @return Outputs of signing messages.
         */
        signMessage: AsyncMapFunction<SignMessageInput, SignMessageOutput>;
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
