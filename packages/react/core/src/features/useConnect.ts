import type { StandardConnectFeature, StandardConnectInput, StandardConnectMethod } from '@wallet-standard/features';
import { StandardConnect } from '@wallet-standard/features';
import type { UiWallet, UiWalletAccount } from '@wallet-standard/ui';
import { getWalletFeature } from '@wallet-standard/ui';
import {
    getOrCreateUiWalletAccountForStandardWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
    getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
} from '@wallet-standard/ui-registry';
import { useCallback } from 'react';

import { useWeakRef } from '../useWeakRef.js';

type TupleSplit<T extends any[], N extends number> = N extends T['length']
    ? [T, []]
    : [T extends [...infer U, ...infer R] ? [...U, ...TupleSplit<R, N>[0]] : never, TupleSplit<T, N>[1]];

type SkipFirst<T extends any[], N extends number> = T extends [] ? [] : TupleSplit<T, N>[1];

/**
 * Returns a function you can call to ask the wallet to authorize the current domain to use new
 * accounts.
 */
export function useConnect<TWallet extends UiWallet>(
    uiWallet: TWallet
): [
    isConnecting: boolean,
    connect: (
        input?: Omit<NonNullable<Parameters<StandardConnectMethod>[0]>, 'silent'>,
        ...rest: SkipFirst<Parameters<StandardConnectMethod>, 1>
    ) => Promise<readonly UiWalletAccount[]>,
] {
    const connectFeature = getWalletFeature(
        uiWallet,
        StandardConnect
    ) as StandardConnectFeature[typeof StandardConnect];
    const wallet = getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(uiWallet);
    const connectionPromise = useWeakRef<Promise<readonly UiWalletAccount[]>>(wallet);
    const connect = useCallback(
        async function connect(
            input?: Omit<NonNullable<Parameters<StandardConnectMethod>[0]>, 'silent'>,
            ...rest: SkipFirst<Parameters<StandardConnectMethod>, 1>
        ) {
            if (connectionPromise.current) {
                return connectionPromise.current;
            }
            const newConnectionPromise = connectFeature
                .connect(input, ...rest)
                .then(({ accounts }) => {
                    return accounts.map(
                        getOrCreateUiWalletAccountForStandardWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.bind(
                            null,
                            wallet
                        )
                    ) as readonly UiWalletAccount[];
                })
                .finally(() => {
                    connectionPromise.current = undefined;
                });
            connectionPromise.current = newConnectionPromise;
            return await newConnectionPromise;
        },
        [connectFeature, connectionPromise, wallet]
    );
    const isConnecting = !!connectionPromise.current;
    return [isConnecting, connect];
}
