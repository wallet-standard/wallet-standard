import type { UnionToIntersection } from '@wallet-standard/types';
import type { DecryptFeature } from './decrypt';
import type { EncryptFeature } from './encrypt';
import type { SignAndSendTransactionFeature } from './signAndSendTransaction';
import type { SignMessageFeature } from './signMessage';
import type { SignTransactionFeature } from './signTransaction';
import type { SolanaFeature } from './solana';

export * from './decrypt';
export * from './encrypt';
export * from './signAndSendTransaction';
export * from './signMessage';
export * from './signTransaction';
export * from './solana';

/** TODO: docs */
export type Feature =
    | SignTransactionFeature
    | SignAndSendTransactionFeature
    | SignMessageFeature
    | EncryptFeature
    | DecryptFeature
    | SolanaFeature;

export type FeatureName = keyof UnionToIntersection<Feature>;
