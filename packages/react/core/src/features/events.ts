import type { Wallet, WalletWithFeatures } from '@wallet-standard/base';
import type { StandardEventsFeature } from '@wallet-standard/features';
import { StandardEvents } from '@wallet-standard/features';

export function walletHasStandardEventsFeature(wallet: Wallet): wallet is WalletWithFeatures<StandardEventsFeature> {
    return StandardEvents in wallet.features;
}
