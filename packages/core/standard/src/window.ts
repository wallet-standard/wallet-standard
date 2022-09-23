import type { Wallet } from './wallet.js';

/** Global `window` containing a `navigator.wallets` object. */
export interface WalletsWindow extends Window {
    navigator: WalletsNavigator;
}

/** Global `window.navigator` containing a `wallets` object. */
export interface WalletsNavigator extends Navigator {
    wallets?: NavigatorWallets;
}

/** Global `window.navigator.wallets` object or callback array. */
export type NavigatorWallets = WalletsCallback[] | Wallets;

/**
 * TODO: docs
 */
export type WalletsCallback = (wallets: Pick<Wallets, 'register'>) => void;

/** Global `window.navigator.wallets` object API. */
export interface Wallets {
    /**
     * TODO: docs
     */
    push(...callbacks: ReadonlyArray<WalletsCallback>): void;

    /**
     * TODO: docs
     */
    register(...wallets: ReadonlyArray<Wallet>): () => void;

    /**
     * TODO: docs
     */
    get(): ReadonlyArray<Wallet>;

    /**
     * TODO: docs
     */
    on<E extends WalletsEventNames = WalletsEventNames>(event: E, listener: WalletsEvents[E]): () => void;
}

/** Events emitted by the global `wallets` object. */
export interface WalletsEvents {
    /**
     * Emitted when wallets are registered.
     *
     * @param wallets Wallets that were registered.
     */
    register(...wallets: ReadonlyArray<Wallet>): void;

    /**
     * Emitted when wallets are unregistered.
     *
     * @param wallets Wallets that were unregistered.
     */
    unregister(...wallets: ReadonlyArray<Wallet>): void;
}

/** TODO: docs */
export type WalletsEventNames = keyof WalletsEvents;
