import type { WalletStandardErrorCode } from './codes.js';
import { WALLET_STANDARD_ERROR__PLACEHOLDER } from './codes.js';

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
    [WALLET_STANDARD_ERROR__PLACEHOLDER]: 'Just here until the first error gets created',
};
