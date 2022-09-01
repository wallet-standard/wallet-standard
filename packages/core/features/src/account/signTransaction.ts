import type { WalletAccount } from '@wallet-standard/standard';
import type { AsyncMapFunction } from '@wallet-standard/types';

/** TODO: docs */
export type SignTransactionMethod<A extends WalletAccount> = AsyncMapFunction<
    SignTransactionInput<A>,
    SignTransactionOutput<A>
>;

/** TODO: docs */
export type SignTransactionFeature<A extends WalletAccount> = {
    /** Namespace for the feature. */
    signTransaction: {
        /** Version of the feature API. */
        version: '1.0.0';

        /** Sign transactions using the account's secret key. */
        signTransaction: SignTransactionMethod<A>;
    };
};

/** Input for signing a transaction. */
export type SignTransactionInput<A extends WalletAccount> = {
    /** Chain to use. */
    chain: A['chains'][number];

    /** Serialized transactions, as raw bytes. */
    transaction: Uint8Array;
};

/** Output of signing a transaction. */
export type SignTransactionOutput<A extends WalletAccount> = {
    /**
     * Signed, serialized transactions, as raw bytes.
     * Returning transactions rather than signatures allows multisig wallets, program wallets, and other wallets that
     * use meta-transactions to return a modified, signed transaction.
     */
    signedTransaction: Uint8Array;
};
