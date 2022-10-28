import type { WalletWithFeatures } from '@wallet-standard/base';
import type { DecryptFeature } from './decrypt.js';
import type { EncryptFeature } from './encrypt.js';
import type { SignAndSendTransactionFeature } from './signAndSendTransaction.js';
import type { SignMessageFeature } from './signMessage.js';
import type { SignTransactionFeature } from './signTransaction.js';

/** TODO: docs */
export type ExperimentalFeatures =
    | DecryptFeature
    | EncryptFeature
    | SignAndSendTransactionFeature
    | SignMessageFeature
    | SignTransactionFeature;

/** TODO: docs */
export type WalletWithExperimentalFeatures = WalletWithFeatures<ExperimentalFeatures>;

export * from './ciphers.js';
export * from './decrypt.js';
export * from './encrypt.js';
export * from './signAndSendTransaction.js';
export * from './signMessage.js';
export * from './signTransaction.js';
