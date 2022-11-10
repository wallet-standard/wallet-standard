import type {
    DEPRECATED_WalletsWindow,
    Wallet,
    WalletEventsWindow,
    WindowRegisterWalletEvent,
    WindowRegisterWalletEventCallback,
} from '@wallet-standard/base';

/**
 * Register a {@link "@wallet-standard/base".Wallet} as a Standard Wallet with the app.
 *
 * This dispatches a {@link "@wallet-standard/base".WindowRegisterWalletEvent} to notify the app that the Wallet is
 * ready to be registered.
 *
 * This also adds a listener for {@link "@wallet-standard/base".WindowAppReadyEvent} to listen for a notification from
 * the app that the app is ready to register the Wallet.
 *
 * This combination of event dispatch and listener guarantees that the Wallet will be registered synchronously as soon
 * as the app is ready whether the Wallet loads before or after the app.
 *
 * @param wallet Wallet to register.
 *
 * @group Wallet
 */
export function registerWallet(wallet: Wallet): void {
    const callback: WindowRegisterWalletEventCallback = ({ register }) => register(wallet);
    try {
        (window as WalletEventsWindow).dispatchEvent(new RegisterWalletEvent(callback));
    } catch (error) {
        console.error('wallet-standard:register-wallet event could not be dispatched\n', error);
    }
    try {
        (window as WalletEventsWindow).addEventListener('wallet-standard:app-ready', ({ detail: api }) =>
            callback(api)
        );
    } catch (error) {
        console.error('wallet-standard:app-ready event listener could not be added\n', error);
    }
}

class RegisterWalletEvent extends Event implements WindowRegisterWalletEvent {
    readonly #detail: WindowRegisterWalletEventCallback;

    get detail() {
        return this.#detail;
    }

    get type() {
        return 'wallet-standard:register-wallet' as const;
    }

    constructor(callback: WindowRegisterWalletEventCallback) {
        super('wallet-standard:register-wallet', {
            bubbles: false,
            cancelable: false,
            composed: false,
        });
        this.#detail = callback;
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
 * @deprecated Use {@link registerWallet} instead.
 *
 * @group Deprecated
 */
export function DEPRECATED_registerWallet(wallet: Wallet): void {
    registerWallet(wallet);
    try {
        ((window as DEPRECATED_WalletsWindow).navigator.wallets ||= []).push(({ register }) => register(wallet));
    } catch (error) {
        console.error('window.navigator.wallets could not be pushed\n', error);
    }
}
