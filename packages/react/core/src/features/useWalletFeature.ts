import type { WalletVersion } from '@wallet-standard/base';
import { safeCaptureStackTrace } from '../errors.js';
import type { WalletHandle } from '../WalletHandleRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js';
import { getWalletForHandle_INTERNAL_ONLY_NOT_FOR_EXPORT } from '../WalletHandleRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js';

export function useWalletFeature<TWalletHandle extends WalletHandle>(
    walletHandle: TWalletHandle,
    featureName: TWalletHandle['features'][number],
    version: WalletVersion
): unknown {
    const wallet = getWalletForHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(walletHandle);
    if (wallet.version !== version) {
        const err = new Error(
            `The version (${wallet.version}) of wallet '${wallet.name}' does not satisfy the ` +
                `requested version (${version})`
        );
        safeCaptureStackTrace(err, useWalletFeature);
        throw err;
    }
    if (!(featureName in wallet.features)) {
        const err = new Error(`The wallet '${wallet.name}' does not support the '${featureName}' feature`);
        safeCaptureStackTrace(err, useWalletFeature);
        throw err;
    }
    return wallet.features[featureName];
}
