import type { WalletStandardErrorCode } from './codes.js';
import {
    WALLET_STANDARD_ERROR__FEATURES__WALLET_FEATURE_UNIMPLEMENTED,
    WALLET_STANDARD_ERROR__REGISTRY__WALLET_ACCOUNT_NOT_FOUND,
    WALLET_STANDARD_ERROR__REGISTRY__WALLET_NOT_FOUND,
} from './codes.js';

/**
 * To add a new error, follow the instructions at
 * https://github.com/wallet-standard/wallet-standard/tree/master/packages/core/errors#adding-a-new-error
 *
 * WARNING:
 *   - Don't change the meaning of an error message.
 */
export const WalletStandardErrorMessages: Readonly<{
    // This type makes this data structure exhaustive with respect to `WalletStandardErrorCode`.
    // TypeScript will fail to build this project if add an error code without a message.
    [P in WalletStandardErrorCode]: string;
}> = {
    [WALLET_STANDARD_ERROR__FEATURES__WALLET_FEATURE_UNIMPLEMENTED]:
        "The wallet '$walletName' does not support the `$featureName` feature",
    [WALLET_STANDARD_ERROR__REGISTRY__WALLET_ACCOUNT_NOT_FOUND]:
        "No account with address $address could be found in the '$walletName' wallet",
    [WALLET_STANDARD_ERROR__REGISTRY__WALLET_NOT_FOUND]:
        'No underlying Wallet Standard wallet could be found for this handle. This can happen if ' +
        'the wallet associated with the handle has been unregistered.',
};
