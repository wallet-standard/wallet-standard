import type {
    Wallet,
    Wallets,
    WalletsCallback,
    WalletsEventNames,
    WalletsEvents,
    WalletsWindow,
} from '@wallet-standard/standard';

declare const window: WalletsWindow;

/** TODO: docs */
export function initialize(): Wallets {
    if (typeof window === 'undefined') return create();

    const callbacks = (window.navigator.wallets ||= []);
    // If it's already initialized, don't recreate it, just return it.
    if (!Array.isArray(callbacks)) return callbacks;

    const wallets = create();
    Object.defineProperty(window.navigator, 'wallets', { value: wallets });
    wallets.push(...callbacks);
    return wallets;
}

function create(): Wallets {
    const registered: Wallet[] = [];
    const listeners: { [E in WalletsEventNames]?: WalletsEvents[E][] } = {};

    function push(...callbacks: ReadonlyArray<WalletsCallback>): void {
        for (const callback of callbacks) {
            callback({ register });
        }
    }

    function register(...wallets: ReadonlyArray<Wallet>): () => void {
        registered.push(...wallets);
        listeners['register']?.forEach((listener) => listener(...wallets));
        // Return a function that unregisters the registered wallets.
        return function unregister(): void {
            wallets
                .map((wallet) => registered.indexOf(wallet))
                .filter((index) => index !== -1)
                .sort()
                .reverse()
                .forEach((index) => registered.splice(index, 1));
            listeners['unregister']?.forEach((listener) => listener(...wallets));
        };
    }

    function get(): ReadonlyArray<Wallet> {
        // Return a copy so the registered wallets can't be referenced or mutated.
        return registered.slice();
    }

    function on<E extends WalletsEventNames>(event: E, listener: WalletsEvents[E]): () => void {
        listeners[event]?.push(listener) || (listeners[event] = [listener]);
        // Return a function that removes the event listener.
        return function off(): void {
            listeners[event] = listeners[event]?.filter((existingListener) => listener !== existingListener);
        };
    }

    return { push, register, get, on };
}
