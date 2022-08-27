import type { WalletAccount } from '@wallet-standard/standard';
import type { Wallet } from '@wallet-standard/standard/src';

/** TODO: docs */
export interface WalletAccountWithChainAndFeatures<
    W extends Wallet,
    Chains extends { [name in keyof W['chains']]?: boolean },
    Features extends { [name in keyof W['features']]?: boolean }
> extends WalletAccount<W> {
    chains: Chains;
    features: Features;
}
