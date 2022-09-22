import type { AsyncMapFunction } from '@wallet-standard/types';
import type { SignTransactionInput, SignTransactionOutput } from './signTransaction.js';

/** TODO: docs */
export type SolanaSignTransactionVersion = '1.0.0';

/**
 * TODO: docs
 * Instantiation expression -- https://github.com/microsoft/TypeScript/pull/47607
 */
export declare const solanaSignTransactionMethod: AsyncMapFunction<
    SolanaSignTransactionInput,
    SolanaSignTransactionOutput
>;

/** TODO: docs */
export type SolanaSignTransactionMethod = typeof solanaSignTransactionMethod;

/** TODO: docs */
export type SolanaSignTransactionFeature = {
    /** Namespace for the feature. */
    'standard:solanaSignTransaction': {
        // TODO: think about feature versions more
        /** Version of the feature API. */
        version: SolanaSignTransactionVersion;

        /** TODO: docs */
        supportedTransactionVersions: ReadonlyArray<SolanaTransactionVersion>;

        /**
         * Sign transactions using the account's secret key.
         *
         * @param inputs Inputs for signing transactions.
         *
         * @return Outputs of signing transactions.
         */
        solanaSignTransaction: SolanaSignTransactionMethod;
    };
};

/** TODO: docs */
export type SolanaTransactionVersion = 'legacy' | 0;

/** Input for signing and sending transactions. */
export interface SolanaSignTransactionInput extends SignTransactionInput {
    /** TODO: docs */
    options?: SolanaSignTransactionOptions;
}

/** Output of signing and sending transactions. */
export interface SolanaSignTransactionOutput extends SignTransactionOutput {}

/** Commitment level for preflight of transactions. */
export type SolanaSignTransactionCommitment = 'processed' | 'confirmed' | 'finalized';

// TODO: figure out what options are actually needed
/** Options for signing transactions. */
export type SolanaSignTransactionOptions = {
    /** Preflight commitment level. */
    preflightCommitment?: SolanaSignTransactionCommitment;
    /** The minimum slot that the request can be evaluated at. */
    minContextSlot?: number;
};
