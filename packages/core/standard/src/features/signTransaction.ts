import { WalletAccount } from '../wallet';
import { SignTransactionOnlyFeature } from './signTransactionOnly';

/** TODO: docs */
export type SignTransactionFeature<Account extends WalletAccount> = Readonly<{
    signTransaction: {
        /**
         * Sign transactions using the account's secret key.
         * The transactions may already be partially signed, and may even have a "primary" signature.
         * This feature covers existing `signTransaction` and `signAllTransactions` functionality, matching the SMS Mobile Wallet Adapter SDK.
         *
         * @param input Input for signing transactions.
         *
         * @return Output of signing transactions.
         */
        signTransaction(input: SignTransactionInput<Account>): Promise<SignTransactionOutput<Account>>;
    };
}>;

/** Input for signing transactions. */
export type SignTransactionInput<Account extends WalletAccount> = Readonly<{
    /** Serialized transactions, as raw bytes. */
    transactions: ReadonlyArray<Uint8Array>;

    /** Optional accounts that must also sign the transactions. They must have the `signTransactionOnly` feature. */
    extraSigners?: ReadonlyArray<Account & { features: SignTransactionOnlyFeature<Account> }>;
}>;

/** Result of signing transactions. */
export type SignTransactionOutput<Account extends WalletAccount> = Readonly<{
    /**
     * Signed, serialized transactions, as raw bytes.
     * Returning transactions rather than signatures allows multisig wallets, program wallets, and other wallets that
     * use meta-transactions to return a modified, signed transaction.
     */
    signedTransactions: ReadonlyArray<Uint8Array>;
}>;
