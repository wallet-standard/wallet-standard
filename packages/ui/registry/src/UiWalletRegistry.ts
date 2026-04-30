import type { IdentifierArray, Wallet } from '@wallet-standard/base';
import type { UiWalletAccount, UiWallet } from '@wallet-standard/ui-core';

import { getOrCreateUiWalletAccountForStandardWalletAccount } from './UiWalletAccountRegistry.js';
import { registerWalletHandle } from './UiWalletHandleRegistry.js';
import { identifierArraysAreDifferent } from './compare.js';

const walletsToUiWallets = new WeakMap<Wallet, UiWallet>();

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * Create or obtain the existing `UiWallet` object associated with a Wallet Standard `Wallet`.
 *
 * This method is intended for Wallet Standard UI library authors, or app authors building directly
 * on the UI primitives without a framework-specific adapter.
 */
export function getOrCreateUiWalletForStandardWallet<TWallet extends Wallet>(wallet: TWallet): UiWallet {
    const existingUiWallet = walletsToUiWallets.get(wallet);
    const mustInitialize = !existingUiWallet;
    let uiWallet: Mutable<UiWallet> = existingUiWallet ?? ({} as Mutable<UiWallet>);
    let isDirty = !existingUiWallet;
    function dirtyUiWallet() {
        if (!isDirty) {
            uiWallet = { ...uiWallet } as Mutable<UiWallet>;
            isDirty = true;
        }
    }
    const nextUiWalletAccounts = {
        _cache: [] as UiWalletAccount[],
        *[Symbol.iterator]() {
            if (this._cache.length) {
                yield* this._cache;
            }
            for (const walletAccount of wallet.accounts.slice(this._cache.length)) {
                const uiWalletAccount = getOrCreateUiWalletAccountForStandardWalletAccount(wallet, walletAccount);
                this._cache.push(uiWalletAccount);
                yield uiWalletAccount;
            }
        },
        some(predicateFn: (uiWalletAccount: UiWalletAccount) => boolean) {
            if (this._cache.some(predicateFn)) {
                return true;
            }
            for (const walletAccount of wallet.accounts.slice(this._cache.length)) {
                const uiWalletAccount = getOrCreateUiWalletAccountForStandardWalletAccount(wallet, walletAccount);
                this._cache.push(uiWalletAccount);
                if (predicateFn(uiWalletAccount)) {
                    return true;
                }
            }
            return false;
        },
        get length() {
            return wallet.accounts.length;
        },
    };
    if (
        mustInitialize ||
        uiWallet.accounts.length !== wallet.accounts.length ||
        nextUiWalletAccounts.some((account) => !uiWallet.accounts.includes(account))
    ) {
        dirtyUiWallet();
        uiWallet.accounts = Object.freeze(Array.from(nextUiWalletAccounts));
    }
    if (
        mustInitialize ||
        identifierArraysAreDifferent(uiWallet.features, Object.keys(wallet.features) as IdentifierArray)
    ) {
        dirtyUiWallet();
        uiWallet.features = Object.freeze(Object.keys(wallet.features) as IdentifierArray);
    }
    if (mustInitialize || identifierArraysAreDifferent(uiWallet.chains, wallet.chains)) {
        dirtyUiWallet();
        uiWallet.chains = Object.freeze([...wallet.chains]);
    }
    if (
        mustInitialize ||
        uiWallet.icon !== wallet.icon ||
        uiWallet.name !== wallet.name ||
        uiWallet.version !== wallet.version
    ) {
        dirtyUiWallet();
        uiWallet.icon = wallet.icon;
        uiWallet.name = wallet.name;
        uiWallet.version = wallet.version;
    }
    if (isDirty) {
        walletsToUiWallets.set(wallet, uiWallet);
        registerWalletHandle(uiWallet, wallet);
    }
    return Object.freeze(uiWallet);
}

/** @deprecated Use {@link getOrCreateUiWalletForStandardWallet} instead. */
export const getOrCreateUiWalletForStandardWallet_DO_NOT_USE_OR_YOU_WILL_BE_FIRED =
    getOrCreateUiWalletForStandardWallet;
