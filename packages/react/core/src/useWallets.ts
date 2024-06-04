import type { UiWallet } from '@wallet-standard/ui';
import { getOrCreateUiWalletForStandardWallet_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } from '@wallet-standard/ui-registry';
import { useMemo } from 'react';

import { useWallets_INTERNAL_ONLY_NOT_FOR_EXPORT } from './useWallets_INTERNAL_ONLY_NOT_FOR_EXPORT.js';

/**
 * Vends an array of `UiWallet` objects; one for every registered Wallet Standard `Wallet`.
 */
export function useWallets(): readonly UiWallet[] {
    const wallets = useWallets_INTERNAL_ONLY_NOT_FOR_EXPORT();
    const uiWallets = useMemo(
        () => wallets.map(getOrCreateUiWalletForStandardWallet_DO_NOT_USE_OR_YOU_WILL_BE_FIRED),
        [wallets]
    );
    return uiWallets;
}
