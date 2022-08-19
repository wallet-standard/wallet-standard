import { UnionToIntersection } from '@wallet-standard/types';
import { DecryptFeature } from './decrypt';
import { EncryptFeature } from './encrypt';
import { SignAndSendTransactionFeature } from './signAndSendTransaction';
import { SignMessageFeature } from './signMessage';
import { SignTransactionFeature } from './signTransaction';
import { SolanaFeature } from './solana';

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
