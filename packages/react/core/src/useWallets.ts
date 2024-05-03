import { getWallets } from '@wallet-standard/app';
import type { Wallet, WalletWithFeatures } from '@wallet-standard/base';
import { useCallback, useRef, useSyncExternalStore } from 'react';

import { hasEventsFeature } from './WalletProvider.js';
import { useStable } from './useStable.js';
import type { StandardEventsFeature } from '@wallet-standard/features';
import { StandardEvents } from '@wallet-standard/features';

const NO_WALLETS: readonly Wallet[] = [];

function getServerSnapshot(): readonly Wallet[] {
    return NO_WALLETS;
}

/** TODO: docs */
export function useWallets(): readonly Wallet[] {
    const { get, on } = useStable(getWallets);
    const prevWallets = useRef(get());
    const outputWallets = useRef(prevWallets.current);
    const getSnapshot = useCallback(() => {
        const nextWallets = get();
        if (nextWallets !== prevWallets.current) {
            // The Wallet Standard itself recyled the wallets array wrapper. Use that array.
            outputWallets.current = nextWallets;
        }
        prevWallets.current = nextWallets;
        return outputWallets.current;
    }, [get]);
    const subscribe = useCallback(
        (onStoreChange: () => void) => {
            const disposeRegisterListener = on('register', onStoreChange);
            const disposeUnregisterListener = on('unregister', onStoreChange);
            const walletsWithStandardEventsFeature = get().filter(
                hasEventsFeature
            ) as WalletWithFeatures<StandardEventsFeature>[];
            const disposeWalletChangeListeners = walletsWithStandardEventsFeature.map((wallet) =>
                wallet.features[StandardEvents].on('change', () => {
                    // Despite a change in a property of a wallet, the array that contains the
                    // list of wallets will be reused. The wallets array before and after the
                    // change will be referentially equal.
                    //
                    // Here, we force a new wallets array wrapper to be created by cloning the
                    // array. This gives React the signal to re-render, because it will notice
                    // that the return value of `getSnapshot()` has changed.
                    outputWallets.current = [...get()];
                    onStoreChange();
                })
            );
            return () => {
                disposeRegisterListener();
                disposeUnregisterListener();
                disposeWalletChangeListeners.forEach((d) => d());
            };
        },
        [get, on]
    );
    return useSyncExternalStore<readonly Wallet[]>(subscribe, getSnapshot, getServerSnapshot);
}
