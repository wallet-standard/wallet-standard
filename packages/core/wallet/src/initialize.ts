import type { WalletsCallback, WalletsWindow } from '@wallet-standard/base';

declare const window: WalletsWindow;

export function initialize(...initialCallbacks: WalletsCallback[]): void {
    let callbacks: WalletsCallback[] | null = initialCallbacks;
    let push = (...newCallbacks: WalletsCallback[]) => {
        callbacks?.push(...newCallbacks);
    };

    let wallets = window.navigator.wallets;
    if (!wallets) {
        wallets = Object.freeze({
            get push() {
                return push;
            },
            set push(newPush) {
                if (!callbacks)
                    throw new Error(
                        'window.navigator.wallets was already initialized.\nA wallet may have incorrectly initialized it before the page loaded.'
                    );
                const currentCallbacks = callbacks;
                callbacks = null;
                push = newPush;
                push(...currentCallbacks);
            },
        });

        Object.defineProperty(window.navigator, 'wallets', {
            value: wallets,
            // These normally default to false, but are required if window.navigator.wallets was already defined.
            writable: false,
            configurable: false,
            enumerable: false,
        });
    }

    wallets.push(...callbacks);
}
