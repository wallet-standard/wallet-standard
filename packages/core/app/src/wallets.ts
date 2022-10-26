import type {
    DEPRECATED_WalletsCallback,
    DEPRECATED_WalletsWindow,
    Wallet,
    WalletEventsWindow,
    WindowAppReadyEvent,
    WindowAppReadyEventAPI,
} from '@wallet-standard/base';

/** TODO: docs */
export interface Wallets {
    /**
     * TODO: docs
     */
    register(...wallets: Wallet[]): () => void;

    /**
     * TODO: docs
     */
    get(): ReadonlyArray<Wallet>;

    /**
     * TODO: docs
     */
    on<E extends WalletsEventNames = WalletsEventNames>(event: E, listener: WalletsEvents[E]): () => void;
}

/** TODO: docs */
export interface WalletsEvents {
    /**
     * Emitted when wallets are registered.
     *
     * @param wallets Wallets that were registered.
     */
    register(...wallets: Wallet[]): void;

    /**
     * Emitted when wallets are unregistered.
     *
     * @param wallets Wallets that were unregistered.
     */
    unregister(...wallets: Wallet[]): void;
}

/** TODO: docs */
export type WalletsEventNames = keyof WalletsEvents;

let wallets: Wallets | undefined = undefined;
const registered = new Set<Wallet>();
const listeners: { [E in WalletsEventNames]?: WalletsEvents[E][] } = {};

/**
 * TODO: docs
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

function register(...wallets: Wallet[]): () => void {
    // Filter out wallets that have already been registered.
    // This prevents the same wallet from being registered twice, but it also prevents wallets from being
    // unregistered by reusing a reference to the wallet to obtain the unregister function for it.
    wallets = wallets.filter((wallet) => !registered.has(wallet));
    // If there are no new wallets to register, just return a no-op unregister function.
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    if (!wallets.length) return () => {};

    wallets.forEach((wallet) => registered.add(wallet));
    listeners['register']?.forEach((listener) => guard(() => listener(...wallets)));
    // Return a function that unregisters the registered wallets.
    return function unregister(): void {
        wallets.forEach((wallet) => registered.delete(wallet));
        listeners['unregister']?.forEach((listener) => guard(() => listener(...wallets)));
    };
}

function get(): ReadonlyArray<Wallet> {
    return [...registered];
}

function on<E extends WalletsEventNames>(event: E, listener: WalletsEvents[E]): () => void {
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

/** @deprecated */
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
