import type { WalletStandardErrorCode } from './codes.js';
import type { WalletStandardErrorContext } from './context.js';
import { getErrorMessage } from './message-formatter.js';

export function isWalletStandardError<TErrorCode extends WalletStandardErrorCode>(
    e: unknown,
    code?: TErrorCode
): e is WalletStandardError<TErrorCode> {
    const isWalletStandardError = e instanceof Error && e.name === 'WalletStandardError';
    if (isWalletStandardError) {
        if (code !== undefined) {
            return (e as WalletStandardError<TErrorCode>).context.__code === code;
        }
        return true;
    }
    return false;
}

type WalletStandardErrorCodedContext = Readonly<{
    [P in WalletStandardErrorCode]: (WalletStandardErrorContext[P] extends undefined
        ? object
        : WalletStandardErrorContext[P]) & {
        __code: P;
    };
}>;

export class WalletStandardError<TErrorCode extends WalletStandardErrorCode = WalletStandardErrorCode> extends Error {
    readonly context: WalletStandardErrorCodedContext[TErrorCode];
    constructor(
        ...[code, contextAndErrorOptions]: WalletStandardErrorContext[TErrorCode] extends undefined
            ? [code: TErrorCode, errorOptions?: ErrorOptions | undefined]
            : [
                  code: TErrorCode,
                  contextAndErrorOptions: WalletStandardErrorContext[TErrorCode] & (ErrorOptions | undefined),
              ]
    ) {
        let context: WalletStandardErrorContext[TErrorCode] | undefined;
        let errorOptions: ErrorOptions | undefined;
        if (contextAndErrorOptions) {
            // If the `ErrorOptions` type ever changes, update this code.
            const { cause, ...contextRest } = contextAndErrorOptions;
            if (cause) {
                errorOptions = { cause };
            }
            if (Object.keys(contextRest).length > 0) {
                context = contextRest as WalletStandardErrorContext[TErrorCode];
            }
        }
        const message = getErrorMessage(code, context);
        super(message, errorOptions);
        this.context = {
            __code: code,
            ...context,
        } as WalletStandardErrorCodedContext[TErrorCode];
        // This is necessary so that `isWalletStandardError()` can identify a `WalletStandardError`
        // without having to import the class for use in an `instanceof` check.
        this.name = 'WalletStandardError';
    }
}
