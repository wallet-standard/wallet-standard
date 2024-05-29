# `@wallet-standard/errors`

This package brings together every error message across all Wallet Standard JavaScript modules.

## Reading error messages

### In development mode

When your bundler sets the environment variable `NODE_ENV` to `development`, every error message will be included in the bundle. As such, you will be able to read them in plain language wherever they appear.

> [!WARNING]
> The size of your JavaScript bundle will increase significantly with the inclusion of every error message in development mode. Be sure to build your bundle with `NODE_ENV` set to `production` when you go to production.

### In production mode

When your bundler sets the environment variable `NODE_ENV` to anything other than `development`, error messages will be stripped from the bundle to save space. Only the error code will appear when an error is encountered. Follow the instructions in the error message to convert the error code back to the human-readable error message.

For instance, to recover the error text for the error with code `123`:

```shell
npx @wallet-standard/errors decode -- 123
```

## Adding a new error

1. Add a new exported error code constant to `src/codes.ts`.
2. Add that new constant to the `WalletStandardErrorCode` union in `src/codes.ts`.
3. If you would like the new error to encapsulate context about the error itself (eg. the public keys for which a transaction is missing signatures) define the shape of that context in `src/context.ts`.
4. Add the error's message to `src/messages.ts`. Any context values that you defined above will be interpolated into the message wherever you write `$key`, where `key` is the index of a value in the context (eg. ``'Missing a signature for account `$address`'``).
5. Publish a new version of `@wallet-standard/errors`.
6. Bump the version of `@wallet-standard/errors` in the package from which the error is thrown.

## Removing an error message

-   Don't remove errors.
-   Don't change the meaning of an error message.
-   Don't change or reorder error codes.
-   Don't change or remove members of an error's context.

When an older client throws an error, we want to make sure that they can always decode the error. If you make any of the changes above, old clients will, by definition, not have received your changes. This could make the errors that they throw impossible to decode going forward.

## Catching errors

When you catch a `WalletStandardError` and assert its error code using `isWalletStandardError()`, TypeScript will refine the error's context to the type associated with that error code. You can use that context to render useful error messages, or to make context-aware decisions that help your application to recover from the error.

```tsx
import { WALLET_STANDARD_ERROR__ACCOUNT__FEATURE_NOT_SUPPORTED, isWalletStandardError } from '@wallet-standard/errors';

function MyComponent(props) {
    return (
        <ErrorBoundary FallbackComponent={ErrorComponent}>
            <SignMessageForm account={props.account} />
        </ErrorBoundary>
    );
}
function ErrorComponent({ error }) {
    if (
        isWalletStandardError(error, WALLET_STANDARD_ERROR__ACCOUNT__FEATURE_NOT_SUPPORTED) &&
        error.context.featureName === 'solana:signMessage'
    ) {
        return (
            <span>
                The account <AccountLink account={error.account} /> does not support signing messages. Please choose
                another account.
            </span>
        );
    } else if (error && typeof error === 'object' && 'message' in error) {
        return <span>{String(error.message)}</span>;
    } else {
        return <span>Something went wrong</span>;
    }
}
```
