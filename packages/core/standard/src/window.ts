import type { Wallet } from './wallet.js';

/** Global `window` containing a `navigator.wallets` object. */
export interface WalletsWindow extends Window {
    navigator: WalletsNavigator;
}

/** Global `window.navigator` containing a `wallets` object. */
export interface WalletsNavigator extends Navigator {
    wallets?: NavigatorWallets;
}

/** Global `window.navigator.wallets` object or command array. */
export type NavigatorWallets = Wallets | WalletsCommand[];

/** Global `window.navigator.wallets` object API. */
export interface Wallets {
    /**
     * TODO: docs
     *
     * @param commands TODO: docs
     */
    push(...commands: ReadonlyArray<WalletsCommand>): void;

    /**
     * TODO: docs
     */
    register(wallets: ReadonlyArray<Wallet>): () => void;

    /**
     * TODO: docs
     */
    get(): ReadonlyArray<Wallet>;

    /**
     * TODO: docs
     */
    on<E extends WalletsEventNames = WalletsEventNames>(event: E, listener: WalletsEvents[E]): () => void;
}

// TODO: `register` is the only command wallets need
/** Global `window.navigator.wallets` command array item. */
export type WalletsCommand = WalletsCommandRegister | WalletsCommandGet | WalletsCommandOn;

/** Register wallets. This emits a `register` event. */
export interface WalletsCommandRegister {
    /** TODO: docs */
    method: 'register';

    /** Wallets to register. */
    wallets: ReadonlyArray<Wallet>;

    // TODO: consider making this optional
    /** Function that will be called with a function to unregister the wallets. */
    callback: (unregister: () => void) => void;
}

/** Get the wallets that have been registered. */
export interface WalletsCommandGet {
    /** TODO: docs */
    method: 'get';

    /** Function that will be called with all wallets that have been registered. */
    callback: (wallets: ReadonlyArray<Wallet>) => void;
}

/** Add an event listener to subscribe to events. */
export interface WalletsCommandOn<E extends WalletsEventNames = WalletsEventNames> {
    /** TODO: docs */
    method: 'on';

    /** Event name to listen for. */
    event: E;

    /** Function that will be called when the event is emitted. */
    listener: WalletsEvents[E];

    /** Function that will be called with a function to remove the event listener and unsubscribe. */
    callback: (off: () => void) => void;
}

/** Events emitted by the global `wallets` object. */
export interface WalletsEvents {
    /**
     * Emitted when wallets are registered.
     *
     * @param wallets Wallets that were registered.
     */
    register(wallets: ReadonlyArray<Wallet>): void;

    /**
     * Emitted when wallets are unregistered.
     *
     * @param wallets Wallets that were unregistered.
     */
    unregister(wallets: ReadonlyArray<Wallet>): void;
}

/** TODO: docs */
export type WalletsEventNames = keyof WalletsEvents;
