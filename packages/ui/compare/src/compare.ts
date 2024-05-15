import type { UiWallet, UiWalletAccount } from '@wallet-standard/ui-core';
import { getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } from '@wallet-standard/ui-registry';

/**
 * Given two `UiWalletAccount` objects, this method will tell you if they represent the same
 * underlying `WalletAccount`.
 *
 * `UiWalletAccount` objects are meant to be used in client apps to render UI; they are not the
 * _actual_ underlying `WalletAccount` objects. In particular, they can change over time and you can
 * not presume that two `UiWalletAccount` objects will be referentially equal - even though they
 * represent the 'same' account.
 *
 * WARNING: It is insufficient to compare two accounts on the basis of their addresses; it's
 * possible for two different wallets to be configured with the same account. Use this method
 * whenever you need to know for sure that two `UiWalletAccount` objects represent the same
 * address _and_ belong to the same underlying `Wallet`.
 */
export function uiWalletAccountsAreSame(a: UiWalletAccount, b: UiWalletAccount): boolean {
    if (a.address !== b.address) {
        return false;
    }
    const underlyingWalletA = getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(a);
    const underlyingWalletB = getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(b);
    return underlyingWalletA === underlyingWalletB;
}

/**
 *
 * Given a `UiWalletAccount`, this method will tell you if the account belongs to a specific
 * `UiWallet`.
 *
 * WARNING: It's possible for two different wallets to be configured with the same account. Use this
 * method whenever you need to know for sure that a `UiWalletAccount` belongs to a particular
 * `UiWallet`.
 */
export function uiWalletAccountBelongsToUiWallet(account: UiWalletAccount, wallet: UiWallet): boolean {
    const underlyingWalletForUiWallet = getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(wallet);
    const underlyingWalletForUiWalletAccount = getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(account);
    return underlyingWalletForUiWallet === underlyingWalletForUiWalletAccount;
}
