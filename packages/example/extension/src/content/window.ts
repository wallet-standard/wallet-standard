import type { WalletsWindow } from '@wallet-standard/standard';

import type { Channel } from '../messages';
import { createChannel, createWindowTransport } from '../messages';
import type { MultiChainWalletAccount } from './multiChainWallet';
import { MultiChainWallet } from './multiChainWallet';

declare const window: WalletsWindow<MultiChainWalletAccount> & {
    _channel: Channel;
};

const transport = createWindowTransport(window);
const channel = createChannel(transport);
window._channel = channel;

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
