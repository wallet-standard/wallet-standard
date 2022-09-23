import type { SignTransactionInput, SignTransactionOutput } from '../standard/signTransaction.js';

/** TODO: docs */
export type SolanaSignTransactionFeature = {
    /** Namespace for the feature. */
    'solana:signTransaction': {
        // TODO: think about feature versions more
        /** Version of the feature API. */
        version: SolanaSignTransactionVersion;

        /**
         * Sign transactions using the account's secret key.
         *
         * @param inputs Inputs for signing transactions.
         *
         * @return Outputs of signing transactions.
         */
        signTransaction: SolanaSignTransactionMethod;
    };
};

/** TODO: docs */
export type SolanaSignTransactionVersion = '1.0.0';

/** TODO: docs */
export type SolanaSignTransactionMethod = (
    ...inputs: SolanaSignTransactionInput[]
) => Promise<SolanaSignTransactionOutput[]>;

/** Input for signing and sending transactions. */
export interface SolanaSignTransactionInput extends SignTransactionInput {
    /** TODO: docs */
    options?: SolanaSignTransactionOptions;
}

/** Output of signing and sending transactions. */
export interface SolanaSignTransactionOutput extends SignTransactionOutput {}

// TODO: figure out what options are actually needed
/** Options for signing transactions. */
export type SolanaSignTransactionOptions = {
    /** Preflight commitment level. */
    preflightCommitment?: SolanaTransactionCommitment;
    /** The minimum slot that the request can be evaluated at. */
    minContextSlot?: number;
};

/** Commitment level for transactions. */
export type SolanaTransactionCommitment = 'processed' | 'confirmed' | 'finalized';
