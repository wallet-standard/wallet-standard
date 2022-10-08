import type { WalletWithFeatures } from '@wallet-standard/standard';
import type { ConnectFeature } from './connect.js';
import type { EventsFeature } from './events.js';
import type { SignAndSendTransactionFeature } from './signAndSendTransaction.js';
import type { SignMessageFeature } from './signMessage.js';
import type { SignTransactionFeature } from './signTransaction.js';

/** TODO: docs */
export type StandardFeatures =
    | ConnectFeature
    | EventsFeature
    | SignAndSendTransactionFeature
    | SignMessageFeature
    | SignTransactionFeature;

/** TODO: docs */
export type WalletWithStandardFeatures = WalletWithFeatures<StandardFeatures>;

export * from './connect.js';
export * from './events.js';
export * from './signAndSendTransaction.js';
export * from './signMessage.js';
export * from './signTransaction.js';
