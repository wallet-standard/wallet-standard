import type { Wallet, WalletAccount } from '@wallet-standard/base';

import { identifierArraysAreDifferent } from './compare.js';
import type { ReactWalletAccount } from './ReactWalletAccount.js';
import {
    getWalletForHandle_INTERNAL_ONLY_NOT_FOR_EXPORT,
    registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT,
} from './WalletHandleRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js';

const walletAccountsToReactWalletAccounts = new WeakMap<WalletAccount, ReactWalletAccount>();

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

export function getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT<
    TWallet extends Wallet
>(wallet: TWallet, account: WalletAccount): ReactWalletAccount {
    let existingReactWalletAccount = walletAccountsToReactWalletAccounts.get(account);
    if (existingReactWalletAccount) {
        try {
            if (getWalletForHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(existingReactWalletAccount) !== wallet) {
                existingReactWalletAccount = undefined;
            }
        } catch {
            existingReactWalletAccount = undefined;
        }
    }
    const mustInitialize = !existingReactWalletAccount;
    let reactWalletAccount: Mutable<ReactWalletAccount> =
        existingReactWalletAccount ?? ({} as Mutable<ReactWalletAccount>);
    let isDirty = !existingReactWalletAccount;
    function dirtyReactWallet() {
        if (!isDirty) {
            reactWalletAccount = { ...reactWalletAccount } as Mutable<ReactWalletAccount>;
            isDirty = true;
        }
    }
    if (mustInitialize || identifierArraysAreDifferent(reactWalletAccount.chains, account.chains)) {
        dirtyReactWallet();
        reactWalletAccount.chains = Object.freeze([...account.chains]);
    }
    if (mustInitialize || identifierArraysAreDifferent(reactWalletAccount.features, account.features)) {
        dirtyReactWallet();
        reactWalletAccount.features = Object.freeze([...account.features]);
    }
    if (
        mustInitialize ||
        reactWalletAccount.address !== account.address ||
        reactWalletAccount.icon !== account.icon ||
        reactWalletAccount.label !== account.label ||
        reactWalletAccount.publicKey !== account.publicKey
    ) {
        dirtyReactWallet();
        reactWalletAccount.address = account.address;
        reactWalletAccount.icon = account.icon;
        reactWalletAccount.label = account.label;
        reactWalletAccount.publicKey = account.publicKey;
    }
    if (isDirty) {
        walletAccountsToReactWalletAccounts.set(account, reactWalletAccount);
        registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(reactWalletAccount, wallet);
    }
    return Object.freeze(reactWalletAccount);
}
