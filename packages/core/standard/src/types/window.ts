import { Wallet, WalletAccount } from './wallet';

declare const window: WalletsWindow<WalletAccount>;

/** Browser window containing a global `navigator.wallets` object. */
export interface WalletsWindow<Account extends WalletAccount> extends Window {
    /** Global `navigator.wallets` object. */
    navigator: Navigator & {
        wallets?: Wallets<Account> | WalletsCommand<Account>[];
    };
}

/** Global `navigator.wallets` object API. */
export interface Wallets<Account extends WalletAccount> {
    /**
     * TODO: docs
     *
     * @param commands TODO: docs
     */
    push(...commands: WalletsCommand<Account>[]): void;

    /**
     * TODO: docs
     */
    register(wallets: Wallet<Account>[]): () => void;

    /**
     * TODO: docs
     */
    get(): Wallet<Account>[];

    /**
     * TODO: docs
     */
    on<E extends WalletsEventNames<Account> = WalletsEventNames<Account>>(
        event: E,
        listener: WalletsEvents<Account>[E]
    ): () => void;
}

/** TODO: docs */
export type WalletsCommand<Account extends WalletAccount> =
    | WalletsCommandRegister<Account>
    | WalletsCommandGet<Account>
    | WalletsCommandOn<Account>;

/** Register wallets. This emits a `register` event. */
export interface WalletsCommandRegister<Account extends WalletAccount> {
    /** TODO: docs */
    method: 'register';

    /** Wallets to register. */
    wallets: Wallet<Account>[];

    /** Function that will be called with a function to unregister the wallets. */
    callback: (unregister: () => void) => void;
}

/** Get the wallets that have been registered. */
export interface WalletsCommandGet<Account extends WalletAccount> {
    /** TODO: docs */
    method: 'get';

    /** Function that will be called with all wallets that have been registered. */
    callback: (wallets: Wallet<Account>[]) => void;
}

/** Add an event listener to subscribe to events. */
export interface WalletsCommandOn<
    Account extends WalletAccount,
    E extends WalletsEventNames<Account> = WalletsEventNames<Account>
> {
    /** TODO: docs */
    method: 'on';

    /** Event name to listen for. */
    event: E;

    /** Function that will be called when the event is emitted. */
    listener: WalletsEvents<Account>[E];

    /** Function that will be called with a function to remove the event listener and unsubscribe. */
    callback: (off: () => void) => void;
}

/** Events emitted by the global `wallets` object. */
export interface WalletsEvents<Account extends WalletAccount> {
    /**
     * Emitted when wallets are registered.
     *
     * @param wallets Wallets that were registered.
     */
    register(wallets: Wallet<Account>[]): void;

    /**
     * Emitted when wallets are unregistered.
     *
     * @param wallets Wallets that were unregistered.
     */
    unregister(wallets: Wallet<Account>[]): void;
}

/** TODO: docs */
export type WalletsEventNames<Account extends WalletAccount> = keyof WalletsEvents<Account>;
