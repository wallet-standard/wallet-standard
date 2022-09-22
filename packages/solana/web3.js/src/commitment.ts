import type { Commitment } from '@solana/web3.js';
import type { SolanaTransactionCommitment } from '@wallet-standard/features';

export function getCommitment(commitment?: Commitment): SolanaTransactionCommitment | undefined {
    switch (commitment) {
        case 'processed':
        case 'confirmed':
        case 'finalized':
        case undefined:
            return commitment;
        case 'recent':
            return 'processed';
        case 'single':
        case 'singleGossip':
            return 'confirmed';
        case 'max':
        case 'root':
            return 'finalized';
        default:
            return undefined;
    }
}
