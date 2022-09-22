import type { WalletWithFeatures } from '@wallet-standard/standard';
import type { SolanaSignAndSendTransactionFeature } from './solanaSignAndSendTransaction.js';
import type { SolanaSignTransactionFeature } from './solanaSignTransaction.js';

/** TODO: docs */
export type SolanaFeatures = SolanaSignTransactionFeature | SolanaSignAndSendTransactionFeature;

/** TODO: docs */
export type WalletWithSolanaFeatures = WalletWithFeatures<SolanaFeatures>;

export * from './solanaSignTransaction.js';
export * from './solanaSignAndSendTransaction.js';
