# `@wallet-standard/ui-features`

This package includes functions useful for getting wallet and wallet accounts features.

## Functions

### `getWalletFeature(uiWalletHandle, featureName)`

Given a &lsquo;handle&rsquo; to a wallet (either a `UiWallet` or a `UiWalletAccount`) and the name of a feature, this function returns the feature object from the underlying Wallet Standard `Wallet`. If the wallet does not support the feature, a `WalletStandardError` will be thrown.

```tsx
function ConnectButton({ children, wallet }) {
    const connectFeature = getWalletFeature(wallet, 'standard:connect') as StandardConnectFeature;
    return <button onClick={() => connectFeature.connect()}>{children}</button>;
}

function Error({ error }) {
    let message;
    if (isWalletStandardError(error, WALLET_STANDARD_ERROR__FEATURES__WALLET_FEATURE_UNIMPLEMENTED)) {
        const { featureName, walletName } = error.context;
        message = `The wallet '${walletName}' does not support the ${featureName} feature`;
    } else {
        message = 'Unknown error';
    }
    return <div className="errorMessage">{message}</div>;
}

function App() {
    return (
        <ErrorBoundary FallbackComponent={Error}>
            <ConnectButton>Connect</ConnectButton>
        </ErrorBoundary>
    );
}
```

### `getWalletAccountFeature(uiWalletAccount, featureName)`

Given a `UiWalletAccount` and the name of a feature, this function returns the feature object from the underlying Wallet Standard `Wallet`. This is a specialization of `getWalletFeature()` that takes into consideration that the features supported by a wallet might not be supported by every account in that wallet. In the event that the wallet or account does not support the feature, a `WalletStandardError` will be thrown.
