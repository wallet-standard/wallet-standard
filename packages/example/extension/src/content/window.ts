import type { WalletsWindow } from '@wallet-standard/standard';

import { createRPC, createWindowTransport } from '../messages';
import type { MultiChainWalletAccount } from './multiChainWallet';
import { MultiChainWallet } from './multiChainWallet';

declare const window: WalletsWindow<MultiChainWalletAccount>;

function register(): void {
    const transport = createWindowTransport(window);
    const rpc = createRPC(transport);

    const wallet = new MultiChainWallet(rpc);

    window.navigator.wallets = window.navigator.wallets || [];
    window.navigator.wallets.push({
        method: 'register',
        wallets: [wallet],
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        callback() {},
    });
}

register();
