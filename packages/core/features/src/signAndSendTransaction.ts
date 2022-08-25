import type { WalletAccount } from '@wallet-standard/standard';
import type { AsyncMapFunction } from '@wallet-standard/types';

/**
 * TODO: docs
 * Instantiation expression -- https://github.com/microsoft/TypeScript/pull/47607
 */
export declare const signAndSendTransactionMethod: AsyncMapFunction<
    SignAndSendTransactionInput,
    SignAndSendTransactionOutput
>;

/** TODO: docs */
export type SignAndSendTransactionMethod = typeof signAndSendTransactionMethod;

/** TODO: docs */
export interface SignAndSendTransactionFeature {
    /** Namespace for the feature. */
    signAndSendTransaction: {
        /** Version of the feature API. */
        version: '1.0.0';

        /**
         * Sign transactions using the account's secret key and send them to the chain.
         *
         * @param inputs Inputs for signing and sending transactions.
         *
         * @return Outputs of signing and sending transactions.
         */
        signAndSendTransaction: SignAndSendTransactionMethod;
    };
}

/** Input for signing and sending transactions. */
export interface SignAndSendTransactionInput<Chain extends string = string> {
    /** Account to use. */
    account: WalletAccount<Chain, 'signAndSendTransaction'>;

    /** Chain to use. */
    chain: Chain;

    /** Serialized transaction, as raw bytes. */
    transaction: Uint8Array;
}

/** Output of signing and sending transactions. */
export interface SignAndSendTransactionOutput {
    /** Transaction signature, as raw bytes. */
    signature: Uint8Array;
}
