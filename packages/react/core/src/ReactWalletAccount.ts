import type { WalletAccount } from '@wallet-standard/base';

import type { ReadonlyUint8Array } from './bytes.js';
import type { ReactWallet } from './ReactWallet.js';
import type { WalletHandle } from './WalletHandleRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js';
import { getWalletForHandle_INTERNAL_ONLY_NOT_FOR_EXPORT } from './WalletHandleRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js';

export type ReactWalletAccount = WalletHandle &
    Pick<WalletAccount, 'address' | 'chains' | 'icon' | 'label'> &
    Readonly<{
        publicKey: ReadonlyUint8Array;
    }>;

export function getReactWalletAccountStorageKey(reactWalletAccount: ReactWalletAccount): string {
    const underlyingWallet = getWalletForHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(reactWalletAccount);
    return `${underlyingWallet.name.replace(':', '_')}:${reactWalletAccount.address}`;
}

export function reactWalletAccountsAreSame(a: ReactWalletAccount, b: ReactWalletAccount): boolean {
    if (a.address !== b.address) {
        return false;
    }
    const underlyingWalletA = getWalletForHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(a);
    const underlyingWalletB = getWalletForHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(b);
    return underlyingWalletA === underlyingWalletB;
}

export function reactWalletAccountBelongsToReactWallet(account: ReactWalletAccount, wallet: ReactWallet): boolean {
    const underlyingWalletForReactWallet = getWalletForHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(wallet);
    const underlyingWalletForReactWalletAccount = getWalletForHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(account);
    return underlyingWalletForReactWallet === underlyingWalletForReactWalletAccount;
}
