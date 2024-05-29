import * as WalletStandardErrorCodeModule from '../codes.js';
import type { WalletStandardErrorCode } from '../codes.js';
import type { WalletStandardErrorContext } from '../context.js';
import { isWalletStandardError, WalletStandardError } from '../error.js';

const { WALLET_STANDARD_ERROR__PLACEHOLDER } = WalletStandardErrorCodeModule;

// If this line raises a type error, you might have forgotten to add a new error to the
// `WalletStandardErrorCode` union in `src/codes.ts`.
Object.values(WalletStandardErrorCodeModule) satisfies WalletStandardErrorCode[];

const walletStandardPlaceholderError = new WalletStandardError(WALLET_STANDARD_ERROR__PLACEHOLDER, {
    just: '!',
    here: '!',
    until: '!',
    the: '!',
    first: '!',
    error: '!',
    gets: '!',
    created: '!',
});

{
    const code = walletStandardPlaceholderError.context.__code;
    code satisfies typeof WALLET_STANDARD_ERROR__PLACEHOLDER;
}

walletStandardPlaceholderError.context satisfies WalletStandardErrorContext[typeof WALLET_STANDARD_ERROR__PLACEHOLDER];
// @ts-expect-error Non existent context property.
walletStandardPlaceholderError.context.chains;

// @ts-expect-error Missing context
new WalletStandardError(WALLET_STANDARD_ERROR__PLACEHOLDER);

const unknownError = null as unknown as WalletStandardError;
if (unknownError.context.__code === WALLET_STANDARD_ERROR__PLACEHOLDER) {
    unknownError.context satisfies WalletStandardErrorContext[typeof WALLET_STANDARD_ERROR__PLACEHOLDER];
}

const e = null as unknown;
if (isWalletStandardError(e)) {
    e.context satisfies Readonly<{ __code: WalletStandardErrorCode }>;
}
if (isWalletStandardError(e, WALLET_STANDARD_ERROR__PLACEHOLDER)) {
    e.context satisfies WalletStandardErrorContext[typeof WALLET_STANDARD_ERROR__PLACEHOLDER];
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
