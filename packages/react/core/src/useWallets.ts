import { useMemo } from 'react';

import type { ReactWallet } from './ReactWallet.js';
import { useWallets_INTERNAL_ONLY_NOT_FOR_EXPORT } from './useWallets_INTERNAL_ONLY_NOT_FOR_EXPORT.js';
import { getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT } from './WalletRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js';

/** TODO: docs */
export function useWallets(): readonly ReactWallet[] {
    const wallets = useWallets_INTERNAL_ONLY_NOT_FOR_EXPORT();
    const reactWallets = useMemo(
        () => wallets.map(getOrCreateReactWalletForWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT),
        [wallets]
    );
    return reactWallets;
}
