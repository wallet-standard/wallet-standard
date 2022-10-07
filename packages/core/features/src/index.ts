import type { WalletWithFeatures } from '@wallet-standard/standard';
import type { ConnectFeature } from './connect.js';
import type { DecryptFeature } from './decrypt.js';
import type { EncryptFeature } from './encrypt.js';
import type { EventsFeature } from './events.js';
import type { SignAndSendTransactionFeature } from './signAndSendTransaction.js';
import type { SignMessageFeature } from './signMessage.js';
import type { SignTransactionFeature } from './signTransaction.js';

/** TODO: docs */
export type StandardFeatures =
    | ConnectFeature
    | DecryptFeature
    | EncryptFeature
    | EventsFeature
    | SignAndSendTransactionFeature
    | SignMessageFeature
    | SignTransactionFeature;

/** TODO: docs */
export type WalletWithStandardFeatures = WalletWithFeatures<StandardFeatures>;

export * from './connect.js';
export * from './decrypt.js';
export * from './encrypt.js';
export * from './events.js';
export * from './signAndSendTransaction.js';
export * from './signMessage.js';
export * from './signTransaction.js';
