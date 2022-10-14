import type { SignTransactionInput, SignTransactionOutput } from '@wallet-standard/features';

/** TODO: docs */
export type SolanaSignTransactionFeature = {
    /** Namespace for the feature. */
    'solana:signTransaction': {
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
        signTransaction: SolanaSignTransactionMethod;
    };
};

/** TODO: docs */
export type SolanaSignTransactionVersion = '1.0.0';

/** TODO: docs */
export type SolanaTransactionVersion = 'legacy' | 0;

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

/** Options for signing transactions. */
export type SolanaSignTransactionOptions = {
    /** Preflight commitment level. */
    preflightCommitment?: SolanaTransactionCommitment;
    /** The minimum slot that the request can be evaluated at. */
    minContextSlot?: number;
};

/** Commitment level for transactions. */
export type SolanaTransactionCommitment = 'processed' | 'confirmed' | 'finalized';
