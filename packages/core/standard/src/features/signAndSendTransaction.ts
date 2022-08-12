import type { AsyncMapFunction } from '@wallet-standard/types';

/** TODO: docs */
export type SignAndSendTransactionFeature = Readonly<{
    signAndSendTransaction: {
        /**
         * Sign transactions using the account's secret key and send them to the chain.
         *
         * @param inputs Inputs for signing and sending transactions.
         *
         * @return Outputs of signing and sending transactions.
         */
        signAndSendTransaction: AsyncMapFunction<SignAndSendTransactionInput, SignAndSendTransactionOutput>;
    };
}>;

/** Input for signing and sending transactions. */
export type SignAndSendTransactionInput = Readonly<{
    /** Serialized transaction, as raw bytes. */
    transaction: Uint8Array;

    // TODO: figure out if options for sending need to be supported
}>;

/** Output of signing and sending transactions. */
export type SignAndSendTransactionOutput = Readonly<{
    /** Transaction signature, as raw bytes. */
    signature: Uint8Array;
}>;
