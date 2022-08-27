import type { Wallet, WalletAccount } from './wallet.js';

/** Global `window` containing a `navigator.wallets` object. */
export type WalletsWindow<Account extends WalletAccount> = Window & { navigator: WalletsNavigator<Account> };

/** Global `window.navigator` containing a `wallets` object. */
export type WalletsNavigator<Account extends WalletAccount> = Navigator & { wallets?: NavigatorWallets<Account> };

/** Global `window.navigator.wallets` object or command array. */
export type NavigatorWallets<Account extends WalletAccount> = Wallets<Account> | WalletsCommand<Account>[];

/** Global `window.navigator.wallets` object API. */
export type Wallets<Account extends WalletAccount> = Readonly<{
    /**
     * TODO: docs
     *
     * @param commands TODO: docs
     */
    push(...commands: ReadonlyArray<WalletsCommand<Account>>): void;

    /**
     * TODO: docs
     */
    register(wallets: ReadonlyArray<Wallet<Account>>): () => void;

    /**
     * TODO: docs
     */
    get(): ReadonlyArray<Wallet<Account>>;

    /**
     * TODO: docs
     */
    on<E extends WalletsEventNames<Account> = WalletsEventNames<Account>>(
        event: E,
        listener: WalletsEvents<Account>[E]
    ): () => void;
}>;

/** Global `window.navigator.wallets` command array item. */
export type WalletsCommand<Account extends WalletAccount> =
    | WalletsCommandRegister<Account>
    | WalletsCommandGet<Account>
    | WalletsCommandOn<Account>;

/** Register wallets. This emits a `register` event. */
export type WalletsCommandRegister<Account extends WalletAccount> = Readonly<{
    /** TODO: docs */
    method: 'register';

    /** Wallets to register. */
    wallets: ReadonlyArray<Wallet<Account>>;

    /** Function that will be called with a function to unregister the wallets. */
    callback: (unregister: () => void) => void;
}>;

/** Get the wallets that have been registered. */
export type WalletsCommandGet<Account extends WalletAccount> = Readonly<{
    /** TODO: docs */
    method: 'get';

    /** Function that will be called with all wallets that have been registered. */
    callback: (wallets: ReadonlyArray<Wallet<Account>>) => void;
}>;

/** Add an event listener to subscribe to events. */
export type WalletsCommandOn<
    Account extends WalletAccount,
    E extends WalletsEventNames<Account> = WalletsEventNames<Account>
> = Readonly<{
    /** TODO: docs */
    method: 'on';

    /** Event name to listen for. */
    event: E;

    /** Function that will be called when the event is emitted. */
    listener: WalletsEvents<Account>[E];

    /** Function that will be called with a function to remove the event listener and unsubscribe. */
    callback: (off: () => void) => void;
}>;

/** Events emitted by the global `wallets` object. */
export interface WalletsEvents<Account extends WalletAccount> {
    /**
     * Emitted when wallets are registered.
     *
     * @param wallets Wallets that were registered.
     */
    register(wallets: ReadonlyArray<Wallet<Account>>): void;

    /**
     * Emitted when wallets are unregistered.
     *
     * @param wallets Wallets that were unregistered.
     */
    unregister(wallets: ReadonlyArray<Wallet<Account>>): void;
}

/** TODO: docs */
export type WalletsEventNames<Account extends WalletAccount> = keyof WalletsEvents<Account>;
