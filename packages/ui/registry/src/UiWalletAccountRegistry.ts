import type { Wallet, WalletAccount } from '@wallet-standard/base';
import type { UiWalletAccount } from '@wallet-standard/ui-core';

import { getWalletForHandle, registerWalletHandle } from './UiWalletHandleRegistry.js';
import { byteArraysAreDifferent, identifierArraysAreDifferent } from './compare.js';

const walletAccountsToUiWalletAccounts = new WeakMap<WalletAccount, UiWalletAccount>();

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * Create or obtain the existing `UiWalletAccount` object associated with a Wallet Standard
 * `WalletAccount`.
 *
 * This method is intended for Wallet Standard UI library authors, or app authors building directly
 * on the UI primitives without a framework-specific adapter.
 */
export function getOrCreateUiWalletAccountForStandardWalletAccount<TWallet extends Wallet>(
    wallet: TWallet,
    account: WalletAccount
): UiWalletAccount {
    let existingUiWalletAccount = walletAccountsToUiWalletAccounts.get(account);
    if (existingUiWalletAccount) {
        try {
            if (getWalletForHandle(existingUiWalletAccount) !== wallet) {
                existingUiWalletAccount = undefined;
            }
        } catch {
            existingUiWalletAccount = undefined;
        }
    }
    const mustInitialize = !existingUiWalletAccount;
    let uiWalletAccount: Mutable<UiWalletAccount> = existingUiWalletAccount ?? ({} as Mutable<UiWalletAccount>);
    let isDirty = !existingUiWalletAccount;
    function dirtyUiWallet() {
        if (!isDirty) {
            uiWalletAccount = { ...uiWalletAccount } as Mutable<UiWalletAccount>;
            isDirty = true;
        }
    }
    if (mustInitialize || identifierArraysAreDifferent(uiWalletAccount.chains, account.chains)) {
        dirtyUiWallet();
        uiWalletAccount.chains = Object.freeze([...account.chains]);
    }
    if (mustInitialize || identifierArraysAreDifferent(uiWalletAccount.features, account.features)) {
        dirtyUiWallet();
        uiWalletAccount.features = Object.freeze([...account.features]);
    }
    if (
        mustInitialize ||
        uiWalletAccount.address !== account.address ||
        uiWalletAccount.icon !== account.icon ||
        uiWalletAccount.label !== account.label ||
        byteArraysAreDifferent(uiWalletAccount.publicKey, account.publicKey)
    ) {
        dirtyUiWallet();
        uiWalletAccount.address = account.address;
        uiWalletAccount.icon = account.icon;
        uiWalletAccount.label = account.label;
        uiWalletAccount.publicKey = account.publicKey;
    }
    if (isDirty) {
        walletAccountsToUiWalletAccounts.set(account, uiWalletAccount);
        registerWalletHandle(uiWalletAccount, wallet);
    }
    return Object.freeze(uiWalletAccount);
}

/** @deprecated Use {@link getOrCreateUiWalletAccountForStandardWalletAccount} instead. */
export const getOrCreateUiWalletAccountForStandardWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED =
    getOrCreateUiWalletAccountForStandardWalletAccount;
