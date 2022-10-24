import type { Wallet } from './wallet.js';

/** Global `window.navigator.wallets` interface. */
export interface WindowNavigatorWallets {
    /**
     * TODO: docs
     */
    push(...callbacks: WindowNavigatorWalletsPushCallback[]): void;
}

/**
 * TODO: docs
 */
export type WindowNavigatorWalletsPushCallback = ({ register }: { register(...wallets: Wallet[]): () => void }) => void;

/** Global `navigator` containing a `wallets` interface. */
export interface WalletsNavigator extends Navigator {
    /** TODO: docs */
    wallets?: WindowNavigatorWallets;
}

/** Global `window` containing a `navigator.wallets` interface. */
export interface NavigatorWalletsWindow extends Window {
    /** TODO: docs */
    navigator: WalletsNavigator;
}
