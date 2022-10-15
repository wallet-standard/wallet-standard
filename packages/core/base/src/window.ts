import type { Wallet } from './wallet.js';

/** Global `window` containing a `navigator.wallets` interface. */
export interface WalletsWindow extends Window {
    navigator: WalletsNavigator;
}

/** Global `window.navigator` containing a `wallets` interface. */
export interface WalletsNavigator extends Navigator {
    wallets?: Wallets;
}

/** Global `window.navigator.wallets` interface. */
export interface Wallets {
    /**
     * TODO: docs
     */
    push(...callbacks: ReadonlyArray<WalletsCallback>): void;
}

/**
 * TODO: docs
 */
export type WalletsCallback = (wallets: { register(...wallets: ReadonlyArray<Wallet>): () => void }) => void;
