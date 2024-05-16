import type { WalletVersion } from '@wallet-standard/base';

import { safeCaptureStackTrace } from '../errors.js';
import type { ReactWalletAccount } from '../ReactWalletAccount.js';
import { useWalletFeature } from './useWalletFeature.js';

export function useWalletAccountFeature<TWalletAccount extends ReactWalletAccount>(
    walletAccount: TWalletAccount,
    featureName: TWalletAccount['features'][number],
    version: WalletVersion
): unknown {
    if (!walletAccount.features.includes(featureName)) {
        const err = new Error(`Wallet account ${walletAccount.address} does not support the '${featureName}' feature`);
        safeCaptureStackTrace(err, useWalletAccountFeature);
        throw err;
    }
    return useWalletFeature(walletAccount, featureName, version);
}
