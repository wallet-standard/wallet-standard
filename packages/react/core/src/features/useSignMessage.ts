import type { SignMessageFeature, SignMessageOutput } from '@wallet-standard/experimental-features';
import { useCallback } from 'react';

import type { ReadonlyUint8Array } from '../bytes.js';
import { safeCaptureStackTrace } from '../errors.js';
import type { ReactWalletAccount } from '../ReactWalletAccount.js';
import { getWalletForHandle_INTERNAL_ONLY_NOT_FOR_EXPORT } from '../WalletHandleRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js';
import { useWalletAccountFeature } from './useWalletAccountFeature.js';
import { FEATURE_HOOKS_SUPPORTED_WALLET_VERSION } from './version.js';

// const FEATURE_NAME = 'experimental:signMessage' as const;
const FEATURE_NAME = 'solana:signMessage' as const;

/** TODO: docs */
export function useSignMessage<TWalletAccount extends ReactWalletAccount>(
    reactWalletAccount: TWalletAccount
): (message: ReadonlyUint8Array) => Promise<SignMessageOutput> {
    const signMessageFeature = useWalletAccountFeature(
        reactWalletAccount,
        FEATURE_NAME,
        FEATURE_HOOKS_SUPPORTED_WALLET_VERSION
    ) as SignMessageFeature['experimental:signMessage'];
    const wallet = getWalletForHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(reactWalletAccount);
    const account = wallet.accounts.find(({ address }) => address === reactWalletAccount.address);
    if (!account) {
        const err = new Error('TODO');
        safeCaptureStackTrace(err, useSignMessage);
        throw err;
    }
    return useCallback(
        async (message) => {
            const result = await signMessageFeature.signMessage({
                account,
                message: message as Uint8Array,
            });
            return result[0] as SignMessageOutput;
        },
        [account, signMessageFeature]
    );
}

// export function useSignMessage<TWalletAccount extends ReactWalletAccount>(
//     reactWalletAccount: TWalletAccount
// ): (message: ReadonlyUint8Array) => Promise<SignMessageOutput> {
//     const signMessageFeature = useWalletAccountFeature(
//         reactWalletAccount,
//         FEATURE_NAME,
//         FEATURE_HOOKS_SUPPORTED_WALLET_VERSION
//     ) as SignMessageFeature[typeof FEATURE_NAME];
//     const wallet = getWalletForHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(reactWalletAccount);
//     const account = wallet.accounts.find(({ address }) => address === reactWalletAccount.address);
//     if (!account) {
//         const err = new Error('TODO');
//         safeCaptureStackTrace(err, useSignMessage);
//         throw err;
//     }
//     return useCallback(
//         async (message) => {
//             const result = await signMessageFeature.signMessage({
//                 account,
//                 message: message as Uint8Array,
//             });
//             return result[0] as SignMessageOutput;
//         },
//         [account, signMessageFeature]
//     );
// }
