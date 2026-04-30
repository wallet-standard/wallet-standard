import type { Wallet, WalletAccount } from '@wallet-standard/base';
import {
    WALLET_STANDARD_ERROR__REGISTRY__WALLET_ACCOUNT_NOT_FOUND,
    WALLET_STANDARD_ERROR__REGISTRY__WALLET_NOT_FOUND,
    WalletStandardError,
    safeCaptureStackTrace,
} from '@wallet-standard/errors';
import type { UiWalletAccount, UiWalletHandle } from '@wallet-standard/ui-core';

const uiWalletHandlesToWallets = new WeakMap<UiWalletHandle, Wallet>();

/**
 * Associate a `UiWallet` or `UiWalletAccount` object with a Wallet Standard `Wallet` in the
 * central registry.
 *
 * This method is intended for Wallet Standard UI library authors, or app authors building directly
 * on the UI primitives without a framework-specific adapter.
 */
export function registerWalletHandle(uiWalletHandle: UiWalletHandle, wallet: Wallet): void {
    uiWalletHandlesToWallets.set(uiWalletHandle, wallet);
}

/** @deprecated Use {@link registerWalletHandle} instead. */
export const registerWalletHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = registerWalletHandle;

/**
 * Get the underlying `WalletAccount` object associated with a `UiWalletAccount` UI object.
 *
 * This method is intended for Wallet Standard UI library authors, or app authors building APIs that
 * need to materialize account-based features from UI primitives.
 */
export function getWalletAccountForUiWalletAccount(uiWalletAccount: UiWalletAccount): WalletAccount {
    const wallet = getWalletForHandle(uiWalletAccount);
    const account = wallet.accounts.find(({ address }) => address === uiWalletAccount.address);
    if (!account) {
        const err = new WalletStandardError(WALLET_STANDARD_ERROR__REGISTRY__WALLET_ACCOUNT_NOT_FOUND, {
            address: uiWalletAccount.address,
            walletName: wallet.name,
        });
        safeCaptureStackTrace(err, getWalletAccountForUiWalletAccount);
        throw err;
    }
    return account;
}

/** @deprecated Use {@link getWalletAccountForUiWalletAccount} instead. */
export const getWalletAccountForUiWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = getWalletAccountForUiWalletAccount;

/**
 * Get the underlying `Wallet` object associated with a `UiWallet` or `UiWalletAccount` UI object.
 *
 * This method is intended for Wallet Standard UI library authors, or app authors building APIs that
 * need to materialize wallet-based features from UI primitives.
 */
export function getWalletForHandle(uiWalletHandle: UiWalletHandle): Wallet {
    const wallet = uiWalletHandlesToWallets.get(uiWalletHandle);
    if (!wallet) {
        const err = new WalletStandardError(WALLET_STANDARD_ERROR__REGISTRY__WALLET_NOT_FOUND);
        safeCaptureStackTrace(err, getWalletForHandle);
        throw err;
    }
    return wallet;
}

/** @deprecated Use {@link getWalletForHandle} instead. */
export const getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = getWalletForHandle;
