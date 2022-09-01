import type { WalletAccount } from '@wallet-standard/standard';
import type { AsyncMapFunction } from '@wallet-standard/types';

/** TODO: docs */
export type SignAndSendTransactionMethod<A extends WalletAccount> = AsyncMapFunction<
    SignAndSendTransactionInput<A>,
    SignAndSendTransactionOutput<A>
>;

/** TODO: docs */
export type SignAndSendTransactionFeature<A extends WalletAccount> = {
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
        signAndSendTransaction: SignAndSendTransactionMethod<A>;
    };
};

/** Input for signing and sending transactions. */
export type SignAndSendTransactionInput<A extends WalletAccount> = {
    /** Chain to use. */
    chain: A['chains'][number];

    /** Serialized transaction, as raw bytes. */
    transaction: Uint8Array;
};

/** Output of signing and sending transactions. */
export type SignAndSendTransactionOutput<A extends WalletAccount> = {
    /** Transaction signature, as raw bytes. */
    signature: Uint8Array;
};
