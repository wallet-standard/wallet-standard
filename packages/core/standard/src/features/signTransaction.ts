import { WalletAccount } from '../wallet';
import { SignTransactionOnlyFeature } from './signTransactionOnly';

/** TODO: docs */
export type SignTransactionFeature<Account extends WalletAccount> = Readonly<{
    signTransaction: {
        /**
         * Sign transactions using the account's secret key.
         *
         * @param inputs Inputs for signing transactions.
         *
         * @return Outputs of signing transactions.
         */
        signTransaction(inputs: SignTransactionInputs<Account>): Promise<SignTransactionOutputs<Account>>;
    };
}>;

/** Input for signing a transaction. */
export type SignTransactionInput<Account extends WalletAccount> = Readonly<{
    /** Serialized transactions, as raw bytes. */
    transaction: Uint8Array;

    /** Optional accounts that must also sign the transactions. They must have the `signTransactionOnly` feature. */
    extraSigners?: ReadonlyArray<Account & { features: SignTransactionOnlyFeature<Account> }>;
}>;

/** Inputs for signing transactions. */
export type SignTransactionInputs<Account extends WalletAccount> = ReadonlyArray<SignTransactionInput<Account>>;

/** Output of signing a transaction. */
export type SignTransactionOutput<Account extends WalletAccount> = Readonly<{
    /**
     * Signed, serialized transactions, as raw bytes.
     * Returning transactions rather than signatures allows multisig wallets, program wallets, and other wallets that
     * use meta-transactions to return a modified, signed transaction.
     */
    signedTransaction: Uint8Array;
}>;

/** Outputs of signing transactions. */
export type SignTransactionOutputs<Account extends WalletAccount> = ReadonlyArray<SignTransactionOutput<Account>>;
