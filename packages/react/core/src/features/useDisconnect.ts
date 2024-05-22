import type { StandardDisconnectFeature } from '@wallet-standard/features';
import { StandardDisconnect } from '@wallet-standard/features';
import { useCallback, useRef, useState } from 'react';

import type { ReactWallet } from '../ReactWallet.js';
import { useWalletFeature } from './useWalletFeature.js';
import { FEATURE_HOOKS_SUPPORTED_WALLET_VERSION } from './version.js';

/** TODO: docs */
export function useDisconnect<TWallet extends ReactWallet>(
    reactWallet: TWallet
): [isDisconnecting: boolean, disconnect: () => Promise<void>] {
    const disconnectFeature = useWalletFeature(
        reactWallet,
        StandardDisconnect,
        FEATURE_HOOKS_SUPPORTED_WALLET_VERSION
    ) as StandardDisconnectFeature[typeof StandardDisconnect];
    // TODO: Rewrite this with async transitions for React 19.
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const disconnectionPromise = useRef<Promise<void> | undefined>();
    const disconnect = useCallback(() => {
        if (disconnectionPromise.current) {
            return disconnectionPromise.current;
        }
        setIsDisconnecting(true);
        return (disconnectionPromise.current = disconnectFeature.disconnect().finally(() => {
            disconnectionPromise.current = undefined;
            setIsDisconnecting(false);
        }));
    }, [disconnectFeature]);
    return [isDisconnecting, disconnect];
}
