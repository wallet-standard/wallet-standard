import type { WalletAccount } from '@wallet-standard/standard';
import type { AsyncMapFunction } from '@wallet-standard/types';
import type { WalletAccountWithChainAndFeatures } from './types.js';

/**
 * TODO: docs
 * Instantiation expression -- https://github.com/microsoft/TypeScript/pull/47607
 */
export declare const signTransactionMethod: AsyncMapFunction<SignTransactionInput, SignTransactionOutput>;

/** TODO: docs */
export type SignTransactionMethod = typeof signTransactionMethod;

/** TODO: docs */
export interface SignTransactionFeature {
    /** Namespace for the feature. */
    signTransaction: {
        /** Version of the feature API. */
        version: '1.0.0';

        /** Sign transactions using the account's secret key. */
        signTransaction: SignTransactionMethod;
    };
}

/** Input for signing a transaction. */
export interface SignTransactionInput<Chain extends string = string> {
    /** Account to use. */
    account: WalletAccountWithChainAndFeatures<Chain, { signTransaction: true }>;

    /** Chain to use. */
    chain: Chain;

    /** Serialized transactions, as raw bytes. */
    transaction: Uint8Array;
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
