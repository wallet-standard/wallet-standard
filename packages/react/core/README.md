# `@wallet-standard/react-core`

This package provides React hooks for using Wallet Standard wallets, accounts, and features.

## Hooks

### `useWallets()`

Vends an array of `UiWallet` objects; one for every registered Wallet Standard `Wallet`.

### `useConnect(uiWallet)`

Given a `UiWallet`, this hook returns a function you can call to ask the wallet to authorize the current domain to use new accounts. Calling the returned method will return a promise for the array of account authorized by the wallet.

```tsx
function ConnectButton({ onAccountsConnected, wallet }) {
    const [isConnecting, connect] = useConnect(wallet);
    return (
        <button
            disabled={isConnecting}
            onClick={() => {
                connect.then(onAccountsConnected);
            }}
        >
            Connect Wallet
        </button>
    );
}
```

Be aware that calls to `connect` operate on a single promise that is global to the entire app. If you call `connect` multiple times or from multiple places in your app, the exact same promise will be vended to all callers. This reflects the fact that a wallet can only field one authorization request at a time.

### `useDisconnect(uiWallet)`

Given a `UiWallet`, this hook returns a function you can call to ask the wallet to deauthorize accounts authorized for the current domain, or at least to remove them from the wallet's `accounts` array for the time being, depending on the wallet's implementation of `standard:disconnect`. Call the returned method will return a promise that resolves once the disconnection is complete.

```tsx
function DisconnectButton({ onDisconnected, wallet }) {
    const [isDisconnecting, disconnect] = useDisconnect(wallet);
    return (
        <button
            disabled={isDisconnecting}
            onClick={() => {
                disconnect.then(onDisconnected);
            }}
        >
            Disconnect
        </button>
    );
}
```
