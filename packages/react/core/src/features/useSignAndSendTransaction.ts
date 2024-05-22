import type {
    SignAndSendTransactionFeature,
    SignAndSendTransactionInput,
} from '@wallet-standard/experimental-features';
import { useCallback } from 'react';

import type { ReadonlyUint8Array } from '../bytes.js';
import type { ReactWalletAccount } from '../ReactWalletAccount.js';
import { useWalletAccountFeature } from './useWalletAccountFeature.js';
import { FEATURE_HOOKS_SUPPORTED_WALLET_VERSION } from './version.js';

const FEATURE_NAME = 'experimental:signAndSendTransaction' as const;

/** TODO: docs */
export function useSignAndSendTransaction<TWalletAccount extends ReactWalletAccount>(
    reactWalletAccount: TWalletAccount
): (...inputs: SignAndSendTransactionInput[]) => Promise<readonly ReadonlyUint8Array[]> {
    const signAndSendTransactionFeature = useWalletAccountFeature(
        reactWalletAccount,
        FEATURE_NAME,
        FEATURE_HOOKS_SUPPORTED_WALLET_VERSION
    ) as SignAndSendTransactionFeature[typeof FEATURE_NAME];
    return useCallback(
        async (...inputs) => {
            const results = await signAndSendTransactionFeature.signAndSendTransaction(...inputs);
            const signatures = results.map(({ signature }) => signature);
            return signatures;
        },
        [signAndSendTransactionFeature]
    );
}
