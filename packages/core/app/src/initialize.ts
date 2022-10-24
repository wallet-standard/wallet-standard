import type { Wallet, WalletsCallback, WalletsWindow } from '@wallet-standard/base';

declare const window: WalletsWindow;

let initializedWallets: InitializedWallets | undefined = undefined;

/**
 * TODO: docs
 */
export function initialize(): InitializedWallets {
    // If we've already initialized, just return. Otherwise, initialize.
    if (initializedWallets) return initializedWallets;
    initializedWallets = Object.freeze({ register, get, on });

    // If we're not in a window (e.g. server-side rendering), just return.
    if (typeof window === 'undefined') return initializedWallets;

    // Set up the window.navigator.wallets.push API.
    const wallets = (window.navigator.wallets ||= []);
    if (Array.isArray(wallets)) {
        try {
            // Replace it with our push API.
            Object.defineProperty(window.navigator, 'wallets', {
                value: Object.freeze({ push }),
                // These normally default to false, but are required if window.navigator.wallets was already defined.
                writable: false,
                configurable: false,
                enumerable: false,
            });
            // Call the callbacks.
            push(...wallets);
        } catch (error) {
            console.error(
                'window.navigator.wallets could not be initialized.\nA wallet may have incorrectly initialized it before the page loaded.',
                error
            );
        }
    } else {
        try {
            // It's an object, so replace its push API, and the setter must call our push API with the callbacks.
            window.navigator.wallets.push = push;
        } catch (error) {
            console.error(
                'window.navigator.wallets could not be initialized.\nA wallet may have incorrectly initialized it before the page loaded.',
                error
            );
        }
    }

    return initializedWallets;
}

/** TODO: docs */
export interface InitializedWallets {
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
    on<E extends InitializedWalletsEventNames = InitializedWalletsEventNames>(
        event: E,
        listener: InitializedWalletsEvents[E]
    ): () => void;
}

/** Events emitted by the global `wallets` object. */
export interface InitializedWalletsEvents {
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
export type InitializedWalletsEventNames = keyof InitializedWalletsEvents;

const registered = new Set<Wallet>();
const listeners: { [E in InitializedWalletsEventNames]?: InitializedWalletsEvents[E][] } = {};

function push(...callbacks: WalletsCallback[]): void {
    callbacks.forEach((callback) => guard(() => callback({ register })));
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

function on<E extends InitializedWalletsEventNames>(event: E, listener: InitializedWalletsEvents[E]): () => void {
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
