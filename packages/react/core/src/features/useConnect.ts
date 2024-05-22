import type { StandardConnectFeature } from '@wallet-standard/features';
import { StandardConnect } from '@wallet-standard/features';
import { useCallback, useRef, useState } from 'react';

import type { ReactWallet } from '../ReactWallet.js';
import type { ReactWalletAccount } from '../ReactWalletAccount.js';
import { getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT } from '../WalletAccountRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js';
import { getWalletForHandle_INTERNAL_ONLY_NOT_FOR_EXPORT } from '../WalletHandleRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js';
import { useWalletFeature } from './useWalletFeature.js';
import { FEATURE_HOOKS_SUPPORTED_WALLET_VERSION } from './version.js';

/** TODO: docs */
export function useConnect<TWallet extends ReactWallet>(
    reactWallet: TWallet
): [isConnecting: boolean, connect: () => Promise<readonly ReactWalletAccount[]>] {
    const connectFeature = useWalletFeature(
        reactWallet,
        StandardConnect,
        FEATURE_HOOKS_SUPPORTED_WALLET_VERSION
    ) as StandardConnectFeature[typeof StandardConnect];
    // TODO: Rewrite this with async transitions for React 19.
    const [isConnecting, setIsConnecting] = useState(false);
    const connectionPromise = useRef<Promise<readonly ReactWalletAccount[]> | undefined>();
    const connect = useCallback(() => {
        if (connectionPromise.current) {
            return connectionPromise.current;
        }
        const wallet = getWalletForHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(reactWallet);
        setIsConnecting(true);
        return (connectionPromise.current = connectFeature
            .connect({ silent: false })
            .then(({ accounts }) =>
                accounts.map(
                    getOrCreateReactWalletAccountForStandardWalletAccount_INTERNAL_ONLY_NOT_FOR_EXPORT.bind(
                        null,
                        wallet
                    )
                )
            )
            .finally(() => {
                connectionPromise.current = undefined;
                setIsConnecting(false);
            }));
    }, [connectFeature, reactWallet]);
    return [isConnecting, connect];
}
