import type { WalletWithFeatures } from '@wallet-standard/base';
import type { ConnectFeature } from './connect.js';
import type { DisconnectFeature } from './disconnect.js';
import type { EventsFeature } from './events.js';

/**
 * Type alias for some or all {@link "@wallet-standard/base".Wallet.features} implemented within the reserved `standard`
 * namespace.
 *
 * @group Features
 */
export type StandardFeatures = ConnectFeature | DisconnectFeature | EventsFeature;

/**
 * Type alias for a {@link "@wallet-standard/base".Wallet} that implements some or all {@link StandardFeatures}.
 *
 * @group Features
 */
export type WalletWithStandardFeatures = WalletWithFeatures<StandardFeatures>;

export * from './connect.js';
export * from './disconnect.js';
export * from './events.js';
