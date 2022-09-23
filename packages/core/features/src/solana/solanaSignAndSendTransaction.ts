import type { SignAndSendTransactionInput, SignAndSendTransactionOutput } from '../standard/signAndSendTransaction.js';
import { SolanaSignTransactionOptions, SolanaTransactionCommitment } from './solanaSignTransaction.js';

/** TODO: docs */
export type SolanaSignAndSendTransactionFeature = {
    /** Namespace for the feature. */
    'solana:signAndSendTransaction': {
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
        signAndSendTransaction: SolanaSignAndSendTransactionMethod;
    };
};

/** TODO: docs */
export type SolanaSignAndSendTransactionVersion = '1.0.0';

/** TODO: docs */
export type SolanaSignAndSendTransactionMethod = (
    ...inputs: SolanaSignAndSendTransactionInput[]
) => Promise<SolanaSignAndSendTransactionOutput[]>;

/** Input for signing and sending transactions. */
export interface SolanaSignAndSendTransactionInput extends SignAndSendTransactionInput {
    /** TODO: docs */
    options?: SolanaSignAndSendTransactionOptions;
}

/** Output of signing and sending transactions. */
export interface SolanaSignAndSendTransactionOutput extends SignAndSendTransactionOutput {}

// TODO: figure out what options are actually needed
/** Options for signing and sending transactions. */
export type SolanaSignAndSendTransactionOptions = SolanaSignTransactionOptions & {
    /** Desired commitment level. If provided, confirm the transaction after sending. */
    commitment?: SolanaTransactionCommitment;
    /** Disable transaction verification at the RPC. */
    skipPreflight?: boolean;
    /** Maximum number of times for the RPC node to retry sending the transaction to the leader. */
    maxRetries?: number;
};
