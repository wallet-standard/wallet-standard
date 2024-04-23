import { getWallets } from '@wallet-standard/app';
import type { Wallet } from '@wallet-standard/base';
import { useCallback, useSyncExternalStore } from 'react';
import { useStable } from './useStable.js';

const NO_WALLETS: readonly Wallet[] = [];

function getServerSnapshot(): readonly Wallet[] {
    return NO_WALLETS;
}

/** TODO: docs */
export function useWallets(): readonly Wallet[] {
    const { get: getSnapshot, on } = useStable(getWallets);
    const subscribe = useCallback(
        (callback: () => void) => {
            const disposeRegisterListener = on('register', callback);
            const disposeUnregisterListener = on('unregister', callback);
            return () => {
                disposeRegisterListener();
                disposeUnregisterListener();
            };
        },
        [on]
    );
    return useSyncExternalStore<readonly Wallet[]>(subscribe, getSnapshot, getServerSnapshot);
}
