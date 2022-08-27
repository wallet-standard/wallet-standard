import type { UnionToIntersection } from '@wallet-standard/types';
import type { DecryptFeature } from './decrypt.js';
import type { EncryptFeature } from './encrypt.js';
import type { SignAndSendTransactionFeature } from './signAndSendTransaction.js';
import type { SignMessageFeature } from './signMessage.js';
import type { SignTransactionFeature } from './signTransaction.js';
import type { SolanaFeature } from './solana.js';

export * from './decrypt.js';
export * from './encrypt.js';
export * from './signAndSendTransaction.js';
export * from './signMessage.js';
export * from './signTransaction.js';
export * from './solana.js';

/** TODO: docs */
export type Feature =
    | SignTransactionFeature
    | SignAndSendTransactionFeature
    | SignMessageFeature
    | EncryptFeature
    | DecryptFeature
    | SolanaFeature;

export type FeatureName = keyof UnionToIntersection<Feature>;
