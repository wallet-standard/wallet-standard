import type { WalletsWindow } from '@wallet-standard/standard';
import type { BackpackSolanaWalletAccount } from './wallet.js';
import { BackpackSolanaWallet } from './wallet.js';

declare const window: WalletsWindow<BackpackSolanaWalletAccount>;

export function register(): void {
    window.navigator.wallets = window.navigator.wallets || [];
    window.navigator.wallets.push({
        method: 'register',
        wallets: [new BackpackSolanaWallet()],
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        callback() {},
    });
}
