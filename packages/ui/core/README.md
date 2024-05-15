# `@wallet-standard/ui-core`

This package includes the type definitions of wallets and accounts in client applications.

Client application developers are not expected to construct these objects themselves, but rather to obtain them by using a third-party Wallet Standard UI library appropriate for their UI framework.

## Types

### `UiWalletHandle`

This type represents a `Wallet` or a `WalletAccount` in a client application that has some feature set. It acts as a &lsquo;handle&rsquo; to the underlying `Wallet` instance in the Wallet Standard registry.

### `UiWallet`

This type represents a `Wallet` in a client application. It acts as a &lsquo;handle&rsquo; to the underlying `Wallet` instance in the Wallet Standard registry, and contains a subset of its properties.

You can pass objects of this type around your application, use its `icon` and `name` for display, inspect its `chains` and `features`, and enumerate the `accounts` for which your application has been granted authorization to use.

### `UiWalletAccount`

This type represents a `WalletAccount` in a client application. It acts as a &lsquo;handle&rsquo; to the underlying `WalletAccount` instance in the Wallet Standard registry, and contains a subset of its properties.

You can pass objects of this type around your application, use its `icon` and `name` for display, and inspect its `chains` and `features`.
