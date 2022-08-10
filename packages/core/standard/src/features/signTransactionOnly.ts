import { WalletAccount } from '../wallet';

/** TODO: docs */
export type SignTransactionOnlyFeature<Account extends WalletAccount> = Readonly<{
    signTransactionOnly: {
        /**
         * Sign transactions returning only the signatures, without modifying the transactions.
         *
         * @param inputs Inputs for signing transactions.
         *
         * @return Outputs of signing transactions.
         */
        signTransactionOnly(inputs: SignTransactionOnlyInputs<Account>): Promise<SignTransactionOnlyOutputs<Account>>;
    };
}>;

/** Input for signing a transaction. */
export type SignTransactionOnlyInput<Account extends WalletAccount> = Readonly<{
    /** Serialized transactions, as raw bytes. */
    transaction: Uint8Array;

    /** Optional accounts that must also sign the transactions. They must have the `signTransactionOnly` feature. */
    extraSigners?: ReadonlyArray<Account & { features: SignTransactionOnlyFeature<Account> }>;
}>;

/** Inputs for signing transactions. */
export type SignTransactionOnlyInputs<Account extends WalletAccount> = ReadonlyArray<SignTransactionOnlyInput<Account>>;

/** Output of signing a transaction. */
export type SignTransactionOnlyOutput<Account extends WalletAccount> = Readonly<{
    /** Transaction signatures, as raw bytes. */
    signatures: ReadonlyArray<Uint8Array>;
}>;

/** Outputs of signing transactions. */
export type SignTransactionOnlyOutputs<Account extends WalletAccount> = ReadonlyArray<
    SignTransactionOnlyOutput<Account>
>;
