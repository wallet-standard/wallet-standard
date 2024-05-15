import type { IdentifierArray, Wallet } from '@wallet-standard/base';

import { identifierArraysAreDifferent } from './compare.js';
import type { ReactWalletAccount } from './WalletAccountRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js';
import { getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT } from './WalletAccountRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js';
import type { WalletHandle } from './WalletHandleRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js';
import { registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT } from './WalletHandleRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js';

type ReactWallet = WalletHandle &
    Readonly<
        Pick<Wallet, 'chains' | 'icon' | 'name' | 'version'> & {
            accounts: readonly ReactWalletAccount[];
        }
    >;

const walletsToReactWallets = new WeakMap<Wallet, ReactWallet>();

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

export function getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT<TWallet extends Wallet>(
    wallet: TWallet
): ReactWallet {
    const existingReactWallet = walletsToReactWallets.get(wallet);
    const mustInitialize = !existingReactWallet;
    let reactWallet: Mutable<ReactWallet> = existingReactWallet ?? ({} as Mutable<ReactWallet>);
    let isDirty = !existingReactWallet;
    function dirtyReactWallet() {
        if (!isDirty) {
            reactWallet = { ...reactWallet } as Mutable<ReactWallet>;
            isDirty = true;
        }
    }
    const nextReactWalletAccounts = {
        _cache: [] as ReactWalletAccount[],
        *[Symbol.iterator]() {
            if (this._cache.length) {
                yield* this._cache;
            }
            for (const walletAccount of wallet.accounts.slice(this._cache.length)) {
                const reactWalletAccount =
                    getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
                        wallet,
                        walletAccount
                    );
                this._cache.push(reactWalletAccount);
                yield reactWalletAccount;
            }
        },
        some(predicateFn: (reactWalletAccount: ReactWalletAccount) => boolean) {
            if (this._cache.some(predicateFn)) {
                return true;
            }
            for (const walletAccount of wallet.accounts.slice(this._cache.length)) {
                const reactWalletAccount =
                    getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT(
                        wallet,
                        walletAccount
                    );
                this._cache.push(reactWalletAccount);
                if (predicateFn(reactWalletAccount)) {
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
        reactWallet.accounts.length !== wallet.accounts.length ||
        nextReactWalletAccounts.some((account) => !reactWallet.accounts.includes(account))
    ) {
        dirtyReactWallet();
        reactWallet.accounts = Object.freeze(Array.from(nextReactWalletAccounts));
    }
    if (
        mustInitialize ||
        identifierArraysAreDifferent(reactWallet.features, Object.keys(wallet.features) as IdentifierArray)
    ) {
        dirtyReactWallet();
        reactWallet.features = Object.freeze(Object.keys(wallet.features) as IdentifierArray);
    }
    if (mustInitialize || identifierArraysAreDifferent(reactWallet.chains, wallet.chains)) {
        dirtyReactWallet();
        reactWallet.chains = Object.freeze([...wallet.chains]);
    }
    if (
        mustInitialize ||
        reactWallet.icon !== wallet.icon ||
        reactWallet.name !== wallet.name ||
        reactWallet.version !== wallet.version
    ) {
        dirtyReactWallet();
        reactWallet.icon = wallet.icon;
        reactWallet.name = wallet.name;
        reactWallet.version = wallet.version;
    }
    if (isDirty) {
        walletsToReactWallets.set(wallet, reactWallet);
        registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(reactWallet, wallet);
    }
    return Object.freeze(reactWallet);
}
