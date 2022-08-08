import { WalletAccount } from '../wallet';

/** TODO: docs */
export type SignTransactionOnlyFeature<Account extends WalletAccount> = Readonly<{
    signTransactionOnly: {
        /**
         * Sign transactions returning only the signatures, without modifying the transactions.
         * The transactions may already be partially signed, and may even have a "primary" signature.
         *
         * @param input Input for signing transactions.
         *
         * @return Output of signing transactions.
         */
        signTransactionOnly(input: SignTransactionOnlyInput<Account>): Promise<SignTransactionOnlyOutput<Account>>;
    };
}>;

/** Input for signing transactions. */
export type SignTransactionOnlyInput<Account extends WalletAccount> = Readonly<{
    /** Serialized transactions, as raw bytes. */
    transactions: ReadonlyArray<Uint8Array>;

    /** Optional accounts that must also sign the transactions. They must have the `signTransactionOnly` feature. */
    extraSigners?: ReadonlyArray<Account & { features: SignTransactionOnlyFeature<Account> }>;
}>;

/** Result of signing transactions. */
export type SignTransactionOnlyOutput<Account extends WalletAccount> = Readonly<{
    /** "Primary" transaction signatures, as raw bytes. */
    signatures: ReadonlyArray<Uint8Array>;
}>;
