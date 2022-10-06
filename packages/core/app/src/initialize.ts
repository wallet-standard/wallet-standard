import type { Wallet, WalletsCallback, WalletsWindow, Wallets } from '@wallet-standard/standard';

declare const window: WalletsWindow;

let initialized: InitializedWallets | undefined = undefined;

/**
 * TODO: docs
 */
export function initialize(): InitializedWallets {
    // If it's already initialized by us, just return it.
    if (initialized) return initialized;
    // If we're not in a window (e.g. server-side rendering), initialize and return it.
    if (typeof window === 'undefined') return (initialized = Object.freeze({ register, get, on }));

    const wallets = (window.navigator.wallets ||= []);

    // If it's not initialized, initialize it and call all the wallet callbacks.
    if (Array.isArray(wallets)) {
        initialized = Object.freeze({ register, get, on });
        Object.defineProperty(window.navigator, 'wallets', { value: Object.freeze({ push }) });
        push(...wallets);
    }
    // If it's already initialized, and we didn't initialize it, throw an error.
    else if (!initialized) throw new Error('window.navigator.wallets was already initialized');

    return initialized;
}

/** TODO: docs */
export interface InitializedWallets {
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
     * @param wallets InitializedWallets that were registered.
     */
    register(...wallets: ReadonlyArray<Wallet>): void;

    /**
     * Emitted when wallets are unregistered.
     *
     * @param wallets InitializedWallets that were unregistered.
     */
    unregister(...wallets: ReadonlyArray<Wallet>): void;
}

/** TODO: docs */
export type WalletsEventNames = keyof WalletsEvents;

const registered = new Set<Wallet>();
const listeners: { [E in WalletsEventNames]?: WalletsEvents[E][] } = {};

function push(...callbacks: ReadonlyArray<WalletsCallback>): void {
    for (const callback of callbacks) {
        callback({ register });
    }
}

function register(...wallets: ReadonlyArray<Wallet>): () => void {
    // Filter out wallets that have already been registered.
    // This prevents the same wallet from being registered twice, but it also prevents wallets from being
    // unregistered by reusing a reference to the wallet to obtain the unregister function for it.
    wallets = wallets.filter((wallet) => !registered.has(wallet));
    // If there are no new wallets to register, just return a no-op unregister function.
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    if (!wallets.length) return () => {};

    wallets.forEach((wallet) => registered.add(wallet));
    listeners['register']?.forEach((listener) => listener(...wallets));
    // Return a function that unregisters the registered wallets.
    return function unregister(): void {
        wallets.forEach((wallet) => registered.delete(wallet));
        listeners['unregister']?.forEach((listener) => listener(...wallets));
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
