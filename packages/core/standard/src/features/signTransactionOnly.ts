import { WalletAccount } from '../wallet';

/** TODO: docs */
export type SignTransactionOnlyFeature = Readonly<{
    signTransactionOnly: {
        /**
         * Sign transactions returning only the signatures, without modifying the transactions.
         *
         * @param inputs Inputs for signing transactions.
         *
         * @return Outputs of signing transactions.
         */
        signTransactionOnly(inputs: SignTransactionOnlyInputs): Promise<SignTransactionOnlyOutputs>;
    };
}>;

/** Input for signing a transaction. */
export type SignTransactionOnlyInput = Readonly<{
    /** Serialized transactions, as raw bytes. */
    transaction: Uint8Array;

    /** Optional accounts that must also sign the transactions. They must have the `signTransactionOnly` feature. */
    extraSigners?: ReadonlyArray<WalletAccount & { features: SignTransactionOnlyFeature }>;
}>;

/** Inputs for signing transactions. */
export type SignTransactionOnlyInputs = ReadonlyArray<SignTransactionOnlyInput>;

/** Output of signing a transaction. */
export type SignTransactionOnlyOutput = Readonly<{
    /** Transaction signatures, as raw bytes. */
    signatures: ReadonlyArray<Uint8Array>;
}>;

/** Outputs of signing transactions. */
export type SignTransactionOnlyOutputs = ReadonlyArray<SignTransactionOnlyOutput>;
