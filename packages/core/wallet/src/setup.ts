import type { NavigatorWalletsWindow, WindowNavigatorWalletsPushCallback } from '@wallet-standard/base';

declare const window: NavigatorWalletsWindow;

export function setupWindowNavigatorWallets(...initialCallbacks: WindowNavigatorWalletsPushCallback[]): void {
    let callbacks: WindowNavigatorWalletsPushCallback[] | null = initialCallbacks;
    let push = (...newCallbacks: WindowNavigatorWalletsPushCallback[]) => {
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
