import type { IdentifierString } from '@wallet-standard/standard';
import type { AsyncMapFunction } from '@wallet-standard/types';
import type { SignTransactionInput } from './signTransaction.js';

/** TODO: docs */
export type SignAndSendTransactionVersion = '1.0.0';

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
export type SignAndSendTransactionFeature = {
    /** Namespace for the feature. */
    'standard:signAndSendTransaction': {
        /** Version of the feature API. */
        version: SignAndSendTransactionVersion;

        /**
         * Sign transactions using the account's secret key and send them to the chain.
         *
         * @param inputs Inputs for signing and sending transactions.
         *
         * @return Outputs of signing and sending transactions.
         */
        signAndSendTransaction: SignAndSendTransactionMethod;
    };
};

/** Input for signing and sending transactions. */
export interface SignAndSendTransactionInput extends SignTransactionInput {
    /** Chain to use. */
    chain: IdentifierString;
}

/** Output of signing and sending transactions. */
export interface SignAndSendTransactionOutput {
    /** Transaction signature, as raw bytes. */
    signature: Uint8Array;
}
