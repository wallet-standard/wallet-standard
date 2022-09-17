import type { WalletsWindow } from '@wallet-standard/standard';
import type { SolflareSolanaWalletAccount } from './wallet.js';
import { SolflareSolanaWallet } from './wallet.js';

declare const window: WalletsWindow<SolflareSolanaWalletAccount>;

export function register(): void {
    window.navigator.wallets = window.navigator.wallets || [];
    window.navigator.wallets.push({
        method: 'register',
        wallets: [new SolflareSolanaWallet()],
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        callback() {},
    });
}
