import type { WalletsWindow } from '@wallet-standard/core';
import { PhantomWallet } from './wallet.js';

declare const window: WalletsWindow;

export function register(): void {
    (window.navigator.wallets ||= []).push(({ register }) => register(new PhantomWallet()));
}
