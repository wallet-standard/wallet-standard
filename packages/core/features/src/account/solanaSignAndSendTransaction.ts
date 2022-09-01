import type { WalletAccount } from '@wallet-standard/standard';
import type { AsyncMapFunction } from '@wallet-standard/types';

/** TODO: docs */
export type SolanaSignAndSendTransactionMethod<A extends WalletAccount> = AsyncMapFunction<
    SolanaSignAndSendTransactionInput<A>,
    SolanaSignAndSendTransactionOutput<A>
>;

/** TODO: docs */
export type SolanaSignAndSendTransactionFeature<A extends WalletAccount> = {
    /** Namespace for the feature. */
    solanaSignAndSendTransaction: {
        // TODO: think about feature versions more
        /** Version of the feature API. */
        version: '1.0.0';

        /**
         * Sign transactions using the account's secret key and send them to the chain.
         *
         * @param inputs Inputs for signing and sending transactions.
         *
         * @return Outputs of signing and sending transactions.
         */
        solanaSignAndSendTransaction: SolanaSignAndSendTransactionMethod<A>;
    };
};

/** Input for signing and sending transactions. */
export type SolanaSignAndSendTransactionInput<A extends WalletAccount> = {
    /** Chain to use. */
    chain: A['chains'][number];

    /** Serialized transaction, as raw bytes. */
    transaction: Uint8Array;

    /** TODO: docs */
    options?: SolanaSignAndSendTransactionOptions<A>;
};

/** Output of signing and sending transactions. */
export type SolanaSignAndSendTransactionOutput<A extends WalletAccount> = {
    /** Transaction signature, as raw bytes. */
    signature: Uint8Array;
};

/** Commitment level for preflight and confirmation of transactions. */
export type SolanaSignAndSendTransactionCommitment = 'processed' | 'confirmed' | 'finalized';

// TODO: figure out what options are actually needed
/** Options for signing and sending transactions. */
export type SolanaSignAndSendTransactionOptions<A extends WalletAccount> = {
    /** Desired commitment level. If provided, confirm the transaction after sending. */
    commitment?: SolanaSignAndSendTransactionCommitment;
    /** Preflight commitment level. */
    preflightCommitment?: SolanaSignAndSendTransactionCommitment;
    /** Disable transaction verification at the RPC. */
    skipPreflight?: boolean;
    /** Maximum number of times for the RPC node to retry sending the transaction to the leader. */
    maxRetries?: number;
    /** The minimum slot that the request can be evaluated at. */
    minContextSlot?: number;
};
