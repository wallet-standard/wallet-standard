import type {
    DEPRECATED_WalletsCallback,
    DEPRECATED_WalletsWindow,
    Wallet,
    WalletEventsWindow,
    WindowAppReadyEvent,
    WindowAppReadyEventAPI,
} from '@wallet-standard/base';

let wallets: Wallets | undefined = undefined;
const registeredWalletsSet = new Set<Wallet>();
function addRegisteredWallet(wallet: Wallet) {
    cachedWalletsArray = undefined;
    registeredWalletsSet.add(wallet);
}
function removeRegisteredWallet(wallet: Wallet) {
    cachedWalletsArray = undefined;
    registeredWalletsSet.delete(wallet);
}
const listeners: { [E in WalletsEventNames]?: WalletsEventsListeners[E][] } = {};

/**
 * Get an API for {@link Wallets.get | getting}, {@link Wallets.on | listening for}, and
 * {@link Wallets.register | registering} {@link "@wallet-standard/base".Wallet | Wallets}.
 *
 * When called for the first time --
 *
 * This dispatches a {@link "@wallet-standard/base".WindowAppReadyEvent} to notify each Wallet that the app is ready
 * to register it.
 *
 * This also adds a listener for {@link "@wallet-standard/base".WindowRegisterWalletEvent} to listen for a notification
 * from each Wallet that the Wallet is ready to be registered by the app.
 *
 * This combination of event dispatch and listener guarantees that each Wallet will be registered synchronously as soon
 * as the app is ready whether the app loads before or after each Wallet.
 *
 * @return API for getting, listening for, and registering Wallets.
 *
 * @group App
 */
export function getWallets(): Wallets {
    if (wallets) return wallets;
    wallets = Object.freeze({ register, get, on });
    if (typeof window === 'undefined') return wallets;

    const api = Object.freeze({ register });
    try {
        (window as WalletEventsWindow).addEventListener('wallet-standard:register-wallet', ({ detail: callback }) =>
            callback(api)
        );
    } catch (error) {
        console.error('wallet-standard:register-wallet event listener could not be added\n', error);
    }
    try {
        (window as WalletEventsWindow).dispatchEvent(new AppReadyEvent(api));
    } catch (error) {
        console.error('wallet-standard:app-ready event could not be dispatched\n', error);
    }

    return wallets;
}

/**
 * API for {@link Wallets.get | getting}, {@link Wallets.on | listening for}, and
 * {@link Wallets.register | registering} {@link "@wallet-standard/base".Wallet | Wallets}.
 *
 * @group App
 */
export interface Wallets {
    /**
     * Get all Wallets that have been registered.
     *
     * @return Registered Wallets.
     */
    get(): readonly Wallet[];

    /**
     * Add an event listener and subscribe to events for Wallets that are
     * {@link WalletsEventsListeners.register | registered} and
     * {@link WalletsEventsListeners.unregister | unregistered}.
     *
     * @param event    Event type to listen for. {@link WalletsEventsListeners.register | `register`} and
     * {@link WalletsEventsListeners.unregister | `unregister`} are the only event types.
     * @param listener Function that will be called when an event of the type is emitted.
     *
     * @return
     * `off` function which may be called to remove the event listener and unsubscribe from events.
     *
     * As with all event listeners, be careful to avoid memory leaks.
     */
    on<E extends WalletsEventNames>(event: E, listener: WalletsEventsListeners[E]): () => void;

    /**
     * Register Wallets. This can be used to programmatically wrap non-standard wallets as Standard Wallets.
     *
     * Apps generally do not need to, and should not, call this.
     *
     * @param wallets Wallets to register.
     *
     * @return
     * `unregister` function which may be called to programmatically unregister the registered Wallets.
     *
     * Apps generally do not need to, and should not, call this.
     */
    register(...wallets: Wallet[]): () => void;
}

/**
 * Types of event listeners of the {@link Wallets} API.
 *
 * @group App
 */
export interface WalletsEventsListeners {
    /**
     * Emitted when Wallets are registered.
     *
     * @param wallets Wallets that were registered.
     */
    register(...wallets: Wallet[]): void;

    /**
     * Emitted when Wallets are unregistered.
     *
     * @param wallets Wallets that were unregistered.
     */
    unregister(...wallets: Wallet[]): void;
}

/**
 * Names of {@link WalletsEventsListeners} that can be listened for.
 *
 * @group App
 */
export type WalletsEventNames = keyof WalletsEventsListeners;

/**
 * @deprecated Use {@link WalletsEventsListeners} instead.
 *
 * @group Deprecated
 */
export type WalletsEvents = WalletsEventsListeners;

function register(...wallets: Wallet[]): () => void {
    // Filter out wallets that have already been registered.
    // This prevents the same wallet from being registered twice, but it also prevents wallets from being
    // unregistered by reusing a reference to the wallet to obtain the unregister function for it.
    wallets = wallets.filter((wallet) => !registeredWalletsSet.has(wallet));
    // If there are no new wallets to register, just return a no-op unregister function.
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    if (!wallets.length) return () => {};

    wallets.forEach((wallet) => addRegisteredWallet(wallet));
    listeners['register']?.forEach((listener) => guard(() => listener(...wallets)));
    // Return a function that unregisters the registered wallets.
    return function unregister(): void {
        wallets.forEach((wallet) => removeRegisteredWallet(wallet));
        listeners['unregister']?.forEach((listener) => guard(() => listener(...wallets)));
    };
}

let cachedWalletsArray: readonly Wallet[] | undefined;
function get(): readonly Wallet[] {
    if (!cachedWalletsArray) {
        cachedWalletsArray = [...registeredWalletsSet];
    }
    return cachedWalletsArray;
}

function on<E extends WalletsEventNames>(event: E, listener: WalletsEventsListeners[E]): () => void {
    listeners[event]?.push(listener) || (listeners[event] = [listener]);
    // Return a function that removes the event listener.
    return function off(): void {
        listeners[event] = listeners[event]?.filter((existingListener) => listener !== existingListener);
    };
}

function guard(callback: () => void) {
    try {
        callback();
    } catch (error) {
        console.error(error);
    }
}

class AppReadyEvent extends Event implements WindowAppReadyEvent {
    readonly #detail: WindowAppReadyEventAPI;

    get detail() {
        return this.#detail;
    }

    get type() {
        return 'wallet-standard:app-ready' as const;
    }

    constructor(api: WindowAppReadyEventAPI) {
        super('wallet-standard:app-ready', {
            bubbles: false,
            cancelable: false,
            composed: false,
        });
        this.#detail = api;
    }

    /** @deprecated */
    preventDefault(): never {
        throw new Error('preventDefault cannot be called');
    }

    /** @deprecated */
    stopImmediatePropagation(): never {
        throw new Error('stopImmediatePropagation cannot be called');
    }

    /** @deprecated */
    stopPropagation(): never {
        throw new Error('stopPropagation cannot be called');
    }
}

/**
 * @deprecated Use {@link getWallets} instead.
 *
 * @group Deprecated
 */
export function DEPRECATED_getWallets(): Wallets {
    if (wallets) return wallets;
    wallets = getWallets();
    if (typeof window === 'undefined') return wallets;

    const callbacks = (window as DEPRECATED_WalletsWindow).navigator.wallets || [];
    if (!Array.isArray(callbacks)) {
        console.error('window.navigator.wallets is not an array');
        return wallets;
    }

    const { register } = wallets;
    const push = (...callbacks: DEPRECATED_WalletsCallback[]): void =>
        callbacks.forEach((callback) => guard(() => callback({ register })));
    try {
        Object.defineProperty((window as DEPRECATED_WalletsWindow).navigator, 'wallets', {
            value: Object.freeze({ push }),
        });
    } catch (error) {
        console.error('window.navigator.wallets could not be set');
        return wallets;
    }

    push(...callbacks);
    return wallets;
}
