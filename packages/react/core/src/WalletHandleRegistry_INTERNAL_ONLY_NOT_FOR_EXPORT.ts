import type { IdentifierArray, Wallet } from '@wallet-standard/base';

import { safeCaptureStackTrace } from './errors.js';

export type WalletHandle = {
    readonly '~walletHandle': unique symbol;
    readonly features: IdentifierArray;
};

const walletHandlesToWallets = new WeakMap<WalletHandle, Wallet>();

export function registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(walletHandle: WalletHandle, wallet: Wallet): void {
    walletHandlesToWallets.set(walletHandle, wallet);
}

export function getWalletForHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(walletHandle: WalletHandle): Wallet {
    const wallet = walletHandlesToWallets.get(walletHandle);
    if (!wallet) {
        const err = new Error(
            'No underlying Wallet Standard wallet could be found for this handle. This can ' +
                'happen if the wallet associated with the handle has been unregistered.'
        );
        safeCaptureStackTrace(err, getWalletForHandle_INTERNAL_ONLY_NOT_FOR_EXPORT);
        throw err;
    }
    return wallet;
}
