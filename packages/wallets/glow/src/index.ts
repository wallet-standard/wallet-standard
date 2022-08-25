import type { WalletsWindow } from '@wallet-standard/standard';
import type { GlowSolanaWalletAccount } from './wallet';
import { GlowSolanaWallet } from './wallet';

declare const window: WalletsWindow<GlowSolanaWalletAccount>;

export function register(): void {
    window.navigator.wallets = window.navigator.wallets || [];
    window.navigator.wallets.push({
        method: 'register',
        wallets: [new GlowSolanaWallet()],
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        callback() {},
    });
}
