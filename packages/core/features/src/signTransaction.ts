import type { IdentifierString, WalletAccount } from '@wallet-standard/base';

/** TODO: docs */
export type SignTransactionFeature = {
    /** Namespace for the feature. */
    'standard:signTransaction': {
        /** Version of the feature API. */
        version: SignTransactionVersion;

        /** Sign transactions using the account's secret key. */
        signTransaction: SignTransactionMethod;
    };
};

/** TODO: docs */
export type SignTransactionVersion = '1.0.0';

/** TODO: docs */
export type SignTransactionMethod = (...inputs: SignTransactionInput[]) => Promise<SignTransactionOutput[]>;

/** Input for signing a transaction. */
export interface SignTransactionInput {
    /** Account to use. */
    account: WalletAccount;

    /** Serialized transactions, as raw bytes. */
    transaction: Uint8Array;

    /** Chain to use. */
    chain?: IdentifierString;
}

/** Output of signing a transaction. */
export interface SignTransactionOutput {
    /**
     * Signed, serialized transactions, as raw bytes.
     * Returning transactions rather than signatures allows multisig wallets, program wallets, and other wallets that
     * use meta-transactions to return a modified, signed transaction.
     */
    signedTransaction: Uint8Array;
}
