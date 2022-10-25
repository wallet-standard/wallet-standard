import type {
    Wallet,
    WalletEventsWindow,
    WindowRegisterWalletEvent as WindowRegisterWalletEventInterface,
    WindowRegisterWalletEventCallback,
} from '@wallet-standard/base';

declare const window: WalletEventsWindow;

export function registerWallet(wallet: Wallet): void {
    const callback: WindowRegisterWalletEventCallback = ({ register }) => register(wallet);
    try {
        window.dispatchEvent(new WindowRegisterWalletEvent(callback));
    } catch (error) {
        console.error('wallet-standard:register-wallet event could not be dispatched\n', error);
    }
    try {
        window.addEventListener('wallet-standard:app-ready', ({ detail: api }) => callback(api));
    } catch (error) {
        console.error('wallet-standard:app-ready event listener could not be added\n', error);
    }
}

class WindowRegisterWalletEvent extends Event implements WindowRegisterWalletEventInterface {
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

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    preventDefault() {}

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    stopImmediatePropagation() {}

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    stopPropagation() {}
}
