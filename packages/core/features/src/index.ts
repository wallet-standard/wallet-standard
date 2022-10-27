import type { WalletWithFeatures } from '@wallet-standard/base';
import type { ConnectFeature } from './connect.js';
import type { DisconnectFeature } from './disconnect.js';
import type { EventsFeature } from './events.js';

/** TODO: docs */
export type StandardFeatures = ConnectFeature | DisconnectFeature | EventsFeature;

/** TODO: docs */
export type WalletWithStandardFeatures = WalletWithFeatures<StandardFeatures>;

export * from './connect.js';
export * from './disconnect.js';
export * from './events.js';
