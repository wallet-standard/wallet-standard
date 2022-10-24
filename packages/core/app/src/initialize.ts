import type {
    AppInitializeEvent as AppInitializeEventInterface,
    AppInitializeEventAPI,
    Wallet,
    WalletEventsWindow,
} from '@wallet-standard/base';

declare const window: WalletEventsWindow | undefined;

/**
 * TODO: docs
 */
export function initializeApp(): InitializedWallets {
    // If we've already initialized, just return. Otherwise, initialize.
    if (initializedWallets) return initializedWallets;
    initializedWallets = Object.freeze({ register, get, on });

    // If we're not in a window (e.g. server-side rendering), just return.
    if (typeof window === 'undefined') return initializedWallets;

    const api = Object.freeze({ register });

    try {
        window.addEventListener('wallet-standard-wallet-initialize', ({ detail }) => detail(api));
    } catch (error) {
        console.error('wallet-standard-wallet-initialize event listener could not be added\n', error);
    }

    try {
        window.dispatchEvent(new AppInitializeEvent(api));
    } catch (error) {
        console.error('wallet-standard-app-initialize event could not be dispatched\n', error);
    }

    return initializedWallets;
}

let initializedWallets: InitializedWallets | undefined = undefined;

/** TODO: docs */
interface InitializedWallets {
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
interface InitializedWalletsEvents {
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
type InitializedWalletsEventNames = keyof InitializedWalletsEvents;

const registered = new Set<Wallet>();
const listeners: { [E in InitializedWalletsEventNames]?: InitializedWalletsEvents[E][] } = {};

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

/** TODO: docs */
class AppInitializeEvent extends CustomEvent<AppInitializeEventAPI> implements AppInitializeEventInterface {
    get type() {
        return 'wallet-standard-app-initialize' as const;
    }

    constructor(api: AppInitializeEventAPI) {
        super('wallet-standard-app-initialize', {
            detail: api,
            bubbles: false,
            cancelable: false,
            composed: false,
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    preventDefault() {}

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    stopImmediatePropagation() {}

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    stopPropagation() {}
}
