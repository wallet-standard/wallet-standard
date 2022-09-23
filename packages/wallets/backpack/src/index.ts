import type { WalletsWindow } from '@wallet-standard/standard';
import { BackpackSolanaWallet } from './wallet.js';

declare const window: WalletsWindow;

export function register(): void {
    (window.navigator.wallets ||= []).push(({ register }) => register(new BackpackSolanaWallet()));
}
