import type { StandardDisconnectFeature, StandardDisconnectMethod } from '@wallet-standard/features';
import { StandardDisconnect } from '@wallet-standard/features';
import type { UiWallet } from '@wallet-standard/ui';
import { getWalletFeature } from '@wallet-standard/ui';
import { getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } from '@wallet-standard/ui-registry';
import { useCallback } from 'react';

import { useWeakRef } from '../useWeakRef.js';

/**
 * Returns a function you can call to ask the wallet to deauthorize accounts authorized for the
 * current domain, or at least to remove them from the wallet's `accounts` array for the time being,
 * depending on the wallet's implementation of `standard:disconnect`.
 */
export function useDisconnect<TWallet extends UiWallet>(
    uiWallet: TWallet
): [isDisconnecting: boolean, disconnect: (...inputs: Parameters<StandardDisconnectMethod>) => Promise<void>] {
    const disconnectFeature = getWalletFeature(
        uiWallet,
        StandardDisconnect
    ) as StandardDisconnectFeature[typeof StandardDisconnect];
    const wallet = getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(uiWallet);
    const disconnectionPromise = useWeakRef<Promise<void> | undefined>(wallet);
    const disconnect = useCallback(
        async function disconnect(...inputs: Parameters<StandardDisconnectMethod>) {
            if (disconnectionPromise.current) {
                return disconnectionPromise.current;
            }
            const newDisconnectionPromise = disconnectFeature.disconnect(...inputs).finally(() => {
                disconnectionPromise.current = undefined;
            });
            disconnectionPromise.current = newDisconnectionPromise;
            return await newDisconnectionPromise;
        },
        [disconnectFeature, disconnectionPromise]
    );
    const isDisconnecting = !!disconnectionPromise.current;
    return [isDisconnecting, disconnect];
}
