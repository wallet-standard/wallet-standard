import type { Wallet } from './wallet.js';

/** Global `window` containing a `navigator.wallets` object. */
export interface WalletsWindow<W extends Wallet = Wallet> extends Window {
    navigator: WalletsNavigator<W>;
}

/** Global `window.navigator` containing a `wallets` object. */
export interface WalletsNavigator<W extends Wallet = Wallet> extends Navigator {
    wallets?: NavigatorWallets<W>;
}

/** Global `window.navigator.wallets` object or command array. */
export type NavigatorWallets<W extends Wallet = Wallet> = Wallets<W> | WalletsCommand<W>[];

/** Global `window.navigator.wallets` object API. */
export interface Wallets<W extends Wallet = Wallet> {
    /**
     * TODO: docs
     *
     * @param commands TODO: docs
     */
    push(...commands: WalletsCommand<W>[]): void;

    /**
     * TODO: docs
     */
    register(wallets: W[]): () => void;

    /**
     * TODO: docs
     */
    get(): W[];

    /**
     * TODO: docs
     */
    on<E extends WalletsEventNames<W> = WalletsEventNames<W>>(event: E, listener: WalletsEvents<W>[E]): () => void;
}

// TODO: `register` is the only command wallets need
/** Global `window.navigator.wallets` command array item. */
export type WalletsCommand<W extends Wallet = Wallet> =
    | WalletsCommandRegister<W>
    | WalletsCommandGet<W>
    | WalletsCommandOn<W>;

/** Register wallets. This emits a `register` event. */
export interface WalletsCommandRegister<W extends Wallet = Wallet> {
    /** TODO: docs */
    method: 'register';

    /** Wallets to register. */
    wallets: W[];

    // TODO: consider making this optional
    /** Function that will be called with a function to unregister the wallets. */
    callback: (unregister: () => void) => void;
}

/** Get the wallets that have been registered. */
export interface WalletsCommandGet<W extends Wallet = Wallet> {
    /** TODO: docs */
    method: 'get';

    /** Function that will be called with all wallets that have been registered. */
    callback: (wallets: W[]) => void;
}

/** Add an event listener to subscribe to events. */
export interface WalletsCommandOn<W extends Wallet = Wallet, E extends WalletsEventNames<W> = WalletsEventNames<W>> {
    /** TODO: docs */
    method: 'on';

    /** Event name to listen for. */
    event: E;

    /** Function that will be called when the event is emitted. */
    listener: WalletsEvents<W>[E];

    /** Function that will be called with a function to remove the event listener and unsubscribe. */
    callback: (off: () => void) => void;
}

/** Events emitted by the global `wallets` object. */
export interface WalletsEvents<W extends Wallet = Wallet> {
    /**
     * Emitted when wallets are registered.
     *
     * @param wallets Wallets that were registered.
     */
    register(wallets: W[]): void;

    /**
     * Emitted when wallets are unregistered.
     *
     * @param wallets Wallets that were unregistered.
     */
    unregister(wallets: W[]): void;
}

/** TODO: docs */
export type WalletsEventNames<W extends Wallet = Wallet> = keyof WalletsEvents<W>;
