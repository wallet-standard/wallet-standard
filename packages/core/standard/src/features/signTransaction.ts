import type { AsyncMapFunction } from '@wallet-standard/types';

// Instantiation expression -- https://github.com/microsoft/TypeScript/pull/47607
declare const signTransactionMethod: AsyncMapFunction<SignTransactionInput, SignTransactionOutput>;

/** TODO: docs */
export type SignTransactionMethod = typeof signTransactionMethod;

/** TODO: docs */
export type SignTransactionFeature = Readonly<{
    /** Namespace for the feature. */
    signTransaction: {
        /** Sign transactions using the account's secret key. */
        signTransaction: SignTransactionMethod;
    };
}>;

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
