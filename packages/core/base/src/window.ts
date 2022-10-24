import type { Wallet } from './wallet.js';

// TODO: consider renaming
/** Global `window.navigator.wallets` interface. */
export interface WindowNavigatorWallets {
    /**
     * TODO: docs
     */
    push(...callbacks: WindowNavigatorWalletsPushCallback[]): void;
}

// TODO: consider renaming
/**
 * TODO: docs
 */
export type WindowNavigatorWalletsPushCallback = ({ register }: { register(...wallets: Wallet[]): () => void }) => void;

// TODO: consider renaming
/** Global `navigator` containing a `wallets` interface. */
export interface WalletsNavigator extends Navigator {
    /** TODO: docs */
    wallets?: WindowNavigatorWallets;
}

// TODO: consider renaming
/** Global `window` containing a `navigator.wallets` interface. */
export interface NavigatorWalletsWindow extends Window {
    /** TODO: docs */
    navigator: WalletsNavigator;
}
