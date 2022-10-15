import type { WalletWithFeatures } from '@wallet-standard/base';
import type { DecryptFeature } from './decrypt.js';
import type { EncryptFeature } from './encrypt.js';

/** TODO: docs */
export type ExperimentalFeatures = DecryptFeature | EncryptFeature;

/** TODO: docs */
export type WalletWithExperimentalFeatures = WalletWithFeatures<ExperimentalFeatures>;

export * from './ciphers.js';
export * from './decrypt.js';
export * from './encrypt.js';
