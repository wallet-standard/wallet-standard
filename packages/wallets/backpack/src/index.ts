import type { WalletsWindow } from '@wallet-standard/standard';
import { BackpackSolanaWallet } from './wallet.js';

declare const window: WalletsWindow;

export function register(): void {
    window.navigator.wallets = window.navigator.wallets || [];
    window.navigator.wallets.push({
        method: 'register',
        wallets: [new BackpackSolanaWallet()],
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        callback() {},
    });
}
