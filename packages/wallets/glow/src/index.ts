import type { WalletsWindow } from '@wallet-standard/standard';
import { GlowSolanaWallet } from './wallet.js';

declare const window: WalletsWindow;

export function register(): void {
    window.navigator.wallets = window.navigator.wallets || [];
    window.navigator.wallets.push({
        method: 'register',
        wallets: [new GlowSolanaWallet()],
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        callback() {},
    });
}
