# @wallet-standard/errors

## 0.1.1

### Patch Changes

- 0ad915c: Update dependencies

## 0.1.0

### Minor Changes

- 96e237c: Minor version bump to previously released packages

### Patch Changes

- 96e237c: Wherever a bytearray is required as input, you can now pass read-only instances of `Uint8Array` – namely ones without mutative methods like `fill` and `reverse`. This makes it so that Wallet Standard methods are _less_ strict about these inputs, and can accept a wider variety of them
- 96e237c: Introduced the `UiWallet` and `UiWalletAccount` data structures. These act both as descriptions of Wallet Standard wallets and accounts, as well as ‘handles’ to the underlying `Wallet` and `WalletAccount` objects in the registry.
- 96e237c: Created `@wallet-standard/errors`; a coded exception class that strips error messages out in production for smaller bundles, while still providing tooling to decode minified production errors
