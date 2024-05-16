import {
    WALLET_STANDARD_ERROR__FEATURES__WALLET_FEATURE_UNIMPLEMENTED,
    WalletStandardError,
    safeCaptureStackTrace,
} from '@wallet-standard/errors';
import type { UiWalletHandle } from '@wallet-standard/ui-core';
import { getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } from '@wallet-standard/ui-registry';

/**
 * Returns the feature object from the Wallet Standard `Wallet` that underlies a `UiWalletHandle`.
 * If the wallet does not support the feature, a `WalletStandardError` will be thrown.
 */
export function getWalletFeature<TWalletHandle extends UiWalletHandle>(
    uiWalletHandle: TWalletHandle,
    featureName: TWalletHandle['features'][number]
): unknown {
    const wallet = getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(uiWalletHandle);
    if (!(featureName in wallet.features)) {
        const err = new WalletStandardError(WALLET_STANDARD_ERROR__FEATURES__WALLET_FEATURE_UNIMPLEMENTED, {
            featureName,
            supportedChains: [...wallet.chains],
            supportedFeatures: Object.keys(wallet.features),
            walletName: wallet.name,
        });
        safeCaptureStackTrace(err, getWalletFeature);
        throw err;
    }
    return wallet.features[featureName];
}
