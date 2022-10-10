import type { Transaction, VersionedTransaction } from '@solana/web3.js';

/** TODO: docs */
export function isVersionedTransaction(
    transaction: Transaction | VersionedTransaction
): transaction is VersionedTransaction {
    return 'version' in transaction;
}
