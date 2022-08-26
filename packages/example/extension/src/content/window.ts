import type { WalletsWindow } from '@wallet-standard/standard';

import type { MultiChainWalletAccount } from './multiChainWallet';
import { MultiChainWallet } from './multiChainWallet';

declare const window: WalletsWindow<MultiChainWalletAccount>;

function register(): void {
    window.navigator.wallets = window.navigator.wallets || [];
    window.navigator.wallets.push({
        method: 'register',
        wallets: [new MultiChainWallet()],
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        callback() {},
    });
}

register();
