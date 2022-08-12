import type { AsyncMapFunction } from '@wallet-standard/types';

/** TODO: docs */
export type SignTransactionFeature = Readonly<{
    signTransaction: {
        /**
         * Sign transactions using the account's secret key.
         *
         * @param inputs Inputs for signing transactions.
         *
         * @return Outputs of signing transactions.
         */
        signTransaction: SignTransactionMethod;
    };
}>;

/** TODO: docs */
export type SignTransactionMethod = AsyncMapFunction<SignTransactionInput, SignTransactionOutput>;

/** Input for signing a transaction. */
export type SignTransactionInput = Readonly<{
    /** Serialized transactions, as raw bytes. */
    transaction: Uint8Array;
}>;

/** Output of signing a transaction. */
export type SignTransactionOutput = Readonly<{
    /**
     * Signed, serialized transactions, as raw bytes.
     * Returning transactions rather than signatures allows multisig wallets, program wallets, and other wallets that
     * use meta-transactions to return a modified, signed transaction.
     */
    signedTransaction: Uint8Array;
}>;
