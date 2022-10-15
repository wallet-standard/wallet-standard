import type { WalletWithFeatures } from '@wallet-standard/base';
import type { ConnectFeature } from './connect.js';
import type { DisconnectFeature } from './disconnect.js';
import type { EventsFeature } from './events.js';
import type { SignAndSendTransactionFeature } from './signAndSendTransaction.js';
import type { SignMessageFeature } from './signMessage.js';
import type { SignTransactionFeature } from './signTransaction.js';

/** TODO: docs */
export type StandardFeatures =
    | ConnectFeature
    | DisconnectFeature
    | EventsFeature
    | SignAndSendTransactionFeature
    | SignMessageFeature
    | SignTransactionFeature;

/** TODO: docs */
export type WalletWithStandardFeatures = WalletWithFeatures<StandardFeatures>;

export * from './connect.js';
export * from './disconnect.js';
export * from './events.js';
export * from './signAndSendTransaction.js';
export * from './signMessage.js';
export * from './signTransaction.js';
