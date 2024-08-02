import { getWallets } from '@wallet-standard/app';
import type { Wallet, WalletWithFeatures } from '@wallet-standard/base';
import { StandardEvents, StandardEventsFeature } from '@wallet-standard/features';
import { useCallback, useRef, useSyncExternalStore } from 'react';

import { walletHasStandardEventsFeature } from './features/events.js';
import { useStable } from './useStable.js';

const NO_WALLETS: readonly Wallet[] = [];

function getServerSnapshot(): readonly Wallet[] {
    return NO_WALLETS;
}

/** TODO: docs */
export function useWallets_INTERNAL_ONLY_NOT_FOR_EXPORT(): readonly Wallet[] {
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
            const walletsToChangeListenerDisposeFn = new Map<Wallet, () => void>();
            function subscribeToWalletEvents(wallet: WalletWithFeatures<StandardEventsFeature>): () => void {
                const dispose = wallet.features[StandardEvents].on('change', () => {
                    // Despite a change in a property of a wallet, the array that contains the
                    // list of wallets will be reused. The wallets array before and after the
                    // change will be referentially equal.
                    //
                    // Here, we force a new wallets array wrapper to be created by cloning the
                    // array. This gives React the signal to re-render, because it will notice
                    // that the return value of `getSnapshot()` has changed.
                    outputWallets.current = [...get()];
                    onStoreChange();
                });
                walletsToChangeListenerDisposeFn.set(wallet, dispose);
                return dispose;
            }
            const disposeRegisterListener = on('register', (...wallets) => {
                wallets.filter(walletHasStandardEventsFeature).map(subscribeToWalletEvents);
                onStoreChange();
            });
            const disposeUnregisterListener = on('unregister', (...wallets) => {
                wallets.forEach((wallet) => {
                    const dispose = walletsToChangeListenerDisposeFn.get(wallet);
                    if (!dispose) {
                        // Not all wallets will have a corresponding dispose function because they
                        // might not support `standard:events`.
                        return;
                    }
                    walletsToChangeListenerDisposeFn.delete(wallet);
                    dispose();
                });
                onStoreChange();
            });
            get().filter(walletHasStandardEventsFeature).map(subscribeToWalletEvents);
            return () => {
                disposeRegisterListener();
                disposeUnregisterListener();
                walletsToChangeListenerDisposeFn.forEach((d) => d());
                walletsToChangeListenerDisposeFn.clear();
            };
        },
        [get, on]
    );
    return useSyncExternalStore<readonly Wallet[]>(subscribe, getSnapshot, getServerSnapshot);
}
