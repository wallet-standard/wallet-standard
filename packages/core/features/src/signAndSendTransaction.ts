import type { AsyncMapFunction } from '@wallet-standard/types';

/**
 * TODO: docs
 * Instantiation expression -- https://github.com/microsoft/TypeScript/pull/47607
 */
export declare const signAndSendTransactionMethod: AsyncMapFunction<
    SignAndSendTransactionInput,
    SignAndSendTransactionOutput
>;

/** TODO: docs */
export type SignAndSendTransactionMethod = typeof signAndSendTransactionMethod;

/** TODO: docs */
export type SignAndSendTransactionFeature = Readonly<{
    /** Namespace for the feature. */
    signAndSendTransaction: {
        /** Version of the feature API. */
        version: '1.0.0';

        /**
         * Sign transactions using the account's secret key and send them to the chain.
         *
         * @param inputs Inputs for signing and sending transactions.
         *
         * @return Outputs of signing and sending transactions.
         */
        signAndSendTransaction: SignAndSendTransactionMethod;
    };
}>;

/** Input for signing and sending transactions. */
export type SignAndSendTransactionInput = Readonly<{
    /** Serialized transaction, as raw bytes. */
    transaction: Uint8Array;
}>;

/** Output of signing and sending transactions. */
export type SignAndSendTransactionOutput = Readonly<{
    /** Transaction signature, as raw bytes. */
    signature: Uint8Array;
}>;
