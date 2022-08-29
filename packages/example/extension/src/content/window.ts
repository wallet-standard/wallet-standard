import type { WalletsWindow } from '@wallet-standard/standard';

import type { RPC } from '../messages';
import { createRPC, createWindowTransport } from '../messages';
import type { MultiChainWalletAccount } from './multiChainWallet';
import { MultiChainWallet } from './multiChainWallet';

declare const window: WalletsWindow<MultiChainWalletAccount> & {
    _rpc: RPC;
};

const transport = createWindowTransport(window);
const rpc = createRPC(transport);
window._rpc = rpc;

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
