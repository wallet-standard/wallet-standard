import type {
    Wallet,
    WalletEventsWindow,
    WalletInitializeEvent as WalletInitializeEventInterface,
    WalletInitializeEventCallback,
} from '@wallet-standard/base';

declare const window: WalletEventsWindow;

export function initializeWallet(wallet: Wallet): void {
    const callback: WalletInitializeEventCallback = ({ register }) => register(wallet);

    try {
        window.dispatchEvent(new WalletInitializeEvent(callback));
    } catch (error) {
        console.error('wallet-standard-wallet-initialize event could not be dispatched\n', error);
    }

    try {
        window.addEventListener('wallet-standard-app-initialize', ({ detail: api }) => callback(api));
    } catch (error) {
        console.error('wallet-standard-app-initialize event listener could not be added\n', error);
    }
}

class WalletInitializeEvent
    extends CustomEvent<WalletInitializeEventCallback>
    implements WalletInitializeEventInterface
{
    get type() {
        return 'wallet-standard-wallet-initialize' as const;
    }

    constructor(callback: WalletInitializeEventCallback) {
        super('wallet-standard-wallet-initialize', {
            detail: callback,
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
