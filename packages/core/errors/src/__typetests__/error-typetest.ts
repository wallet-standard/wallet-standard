import * as WalletStandardErrorCodeModule from '../codes.js';
import type { WalletStandardErrorCode } from '../codes.js';
import type { WalletStandardErrorContext } from '../context.js';
import { isWalletStandardError, WalletStandardError } from '../error.js';

const { WALLET_STANDARD_ERROR__REGISTRY__WALLET_ACCOUNT_NOT_FOUND, WALLET_STANDARD_ERROR__REGISTRY__WALLET_NOT_FOUND } =
    WalletStandardErrorCodeModule;

// If this line raises a type error, you might have forgotten to add a new error to the
// `WalletStandardErrorCode` union in `src/codes.ts`.
Object.values(WalletStandardErrorCodeModule) satisfies WalletStandardErrorCode[];

const walletAccountNotFoundError = new WalletStandardError(WALLET_STANDARD_ERROR__REGISTRY__WALLET_ACCOUNT_NOT_FOUND, {
    address: 'abc',
    walletName: 'Mock Wallet',
});

{
    const code = walletAccountNotFoundError.context.__code;
    code satisfies typeof WALLET_STANDARD_ERROR__REGISTRY__WALLET_ACCOUNT_NOT_FOUND;
    // @ts-expect-error Wrong error code.
    code satisfies typeof WALLET_STANDARD_ERROR__REGISTRY__WALLET_NOT_FOUND;
}

walletAccountNotFoundError.context satisfies WalletStandardErrorContext[typeof WALLET_STANDARD_ERROR__REGISTRY__WALLET_ACCOUNT_NOT_FOUND];
// @ts-expect-error Non existent context property.
walletAccountNotFoundError.context.chains;

new WalletStandardError(WALLET_STANDARD_ERROR__REGISTRY__WALLET_NOT_FOUND);
// @ts-expect-error Missing context property (`address` and `walletName`)
new WalletStandardError(WALLET_STANDARD_ERROR__REGISTRY__WALLET_ACCOUNT_NOT_FOUND);

const unknownError = null as unknown as WalletStandardError;
if (unknownError.context.__code === WALLET_STANDARD_ERROR__REGISTRY__WALLET_ACCOUNT_NOT_FOUND) {
    unknownError.context satisfies WalletStandardErrorContext[typeof WALLET_STANDARD_ERROR__REGISTRY__WALLET_ACCOUNT_NOT_FOUND];
    // @ts-expect-error Context belongs to another error code
    unknownError.context satisfies WalletStandardErrorContext[typeof WALLET_STANDARD_ERROR__REGISTRY__WALLET_NOT_FOUND];
}

const e = null as unknown;
if (isWalletStandardError(e)) {
    e.context satisfies Readonly<{ __code: WalletStandardErrorCode }>;
}
if (isWalletStandardError(e, WALLET_STANDARD_ERROR__REGISTRY__WALLET_ACCOUNT_NOT_FOUND)) {
    e.context satisfies WalletStandardErrorContext[typeof WALLET_STANDARD_ERROR__REGISTRY__WALLET_ACCOUNT_NOT_FOUND];
    // @ts-expect-error Context belongs to another error code
    e.context satisfies WalletStandardErrorContext[typeof WALLET_STANDARD_ERROR__REGISTRY__WALLET_NOT_FOUND];
}

// `WalletStandardErrorContext` must not contain any keys reserved by `ErrorOptions` (eg. `cause`)
null as unknown as WalletStandardErrorContext satisfies {
    [Code in keyof WalletStandardErrorContext]: WalletStandardErrorContext[Code] extends undefined
        ? undefined
        : {
              [PP in keyof WalletStandardErrorContext[Code]]: PP extends keyof ErrorOptions
                  ? never
                  : WalletStandardErrorContext[Code][PP];
          };
};
