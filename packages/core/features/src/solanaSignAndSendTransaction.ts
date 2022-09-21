import type { AsyncMapFunction } from '@wallet-standard/types';
import type { SignAndSendTransactionInput, SignAndSendTransactionOutput } from './signAndSendTransaction.js';

/** TODO: docs */
export type SolanaSignAndSendTransactionVersion = '1.0.0';

/**
 * TODO: docs
 * Instantiation expression -- https://github.com/microsoft/TypeScript/pull/47607
 */
export declare const solanaSignAndSendTransactionMethod: AsyncMapFunction<
    SolanaSignAndSendTransactionInput,
    SolanaSignAndSendTransactionOutput
>;

/** TODO: docs */
export type SolanaSignAndSendTransactionMethod = typeof solanaSignAndSendTransactionMethod;

/** TODO: docs */
export type SolanaSignAndSendTransactionFeature = {
    /** Namespace for the feature. */
    'standard:solanaSignAndSendTransaction': {
        // TODO: think about feature versions more
        /** Version of the feature API. */
        version: SolanaSignAndSendTransactionVersion;

        /**
         * Sign transactions using the account's secret key and send them to the chain.
         *
         * @param inputs Inputs for signing and sending transactions.
         *
         * @return Outputs of signing and sending transactions.
         */
        solanaSignAndSendTransaction: SolanaSignAndSendTransactionMethod;
    };
};

/** Input for signing and sending transactions. */
export interface SolanaSignAndSendTransactionInput extends SignAndSendTransactionInput {
    /** TODO: docs */
    options?: SolanaSignAndSendTransactionOptions;
}

/** Output of signing and sending transactions. */
export interface SolanaSignAndSendTransactionOutput extends SignAndSendTransactionOutput {}

/** Commitment level for preflight and confirmation of transactions. */
export type SolanaSignAndSendTransactionCommitment = 'processed' | 'confirmed' | 'finalized';

// TODO: figure out what options are actually needed
/** Options for signing and sending transactions. */
export type SolanaSignAndSendTransactionOptions = {
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
