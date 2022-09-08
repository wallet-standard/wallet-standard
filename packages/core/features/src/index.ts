import type { IdentifierRecord, Wallet } from '@wallet-standard/standard';
import type { DecryptFeature } from './decrypt.js';
import type { EncryptFeature } from './encrypt.js';
import type { SignAndSendTransactionFeature } from './signAndSendTransaction.js';
import type { SignMessageFeature } from './signMessage.js';
import type { SignTransactionFeature } from './signTransaction.js';
import type { SolanaSignAndSendTransactionFeature } from './solanaSignAndSendTransaction.js';

export type WalletWithFeatures<Features extends IdentifierRecord<unknown>> = Wallet & { features: Features };

export type WalletWithStandardFeatures = WalletWithFeatures<
    | DecryptFeature
    | EncryptFeature
    | SignAndSendTransactionFeature
    | SignMessageFeature
    | SignTransactionFeature
    | SolanaSignAndSendTransactionFeature
>;

export * from './decrypt.js';
export * from './encrypt.js';
export * from './signAndSendTransaction.js';
export * from './signMessage.js';
export * from './signTransaction.js';
export * from './solanaSignAndSendTransaction.js';
