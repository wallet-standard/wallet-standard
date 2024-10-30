# @wallet-standard/core

## 1.1.0

### Minor Changes

-   a8223e8: Minor version bump to previously released packages
-   a8223e8: Introduced the `UiWallet` and `UiWalletAccount` data structures. These act both as descriptions of Wallet Standard wallets and accounts, as well as ‘handles’ to the underlying `Wallet` and `WalletAccount` objects in the registry.
-   a8223e8: Created `@wallet-standard/errors`; a coded exception class that strips error messages out in production for smaller bundles, while still providing tooling to decode minified production errors

### Patch Changes

-   a8223e8: Wherever a bytearray is required as input, you can now pass read-only instances of `Uint8Array` – namely ones without mutative methods like `fill` and `reverse`. This makes it so that Wallet Standard methods are _less_ strict about these inputs, and can accept a wider variety of them
-   a8223e8: Updated to TypeScript 5, latest ESLint plugins, Prettier 3
-   Updated dependencies [a8223e8]
-   Updated dependencies [a8223e8]
-   Updated dependencies [a8223e8]
-   Updated dependencies [a8223e8]
-   Updated dependencies [a8223e8]
-   Updated dependencies [a8223e8]
    -   @wallet-standard/app@1.1.0
    -   @wallet-standard/errors@0.1.0
    -   @wallet-standard/wallet@1.1.0
    -   @wallet-standard/base@1.1.0
    -   @wallet-standard/features@1.1.0

## 1.0.3

### Patch Changes

-   Updated dependencies [6cac3ca]
    -   @wallet-standard/features@1.0.3

## 1.0.2

### Patch Changes

-   Updated dependencies [41add01]
    -   @wallet-standard/features@1.0.2

## 1.0.1

### Patch Changes

-   Updated dependencies [1eefb9f]
    -   @wallet-standard/app@1.0.1
    -   @wallet-standard/base@1.0.1
    -   @wallet-standard/features@1.0.1
    -   @wallet-standard/wallet@1.0.1

## 1.0.0

### Major Changes

-   59d90b2: Release v1.0.0 of core packages, and v0.1.0 of other packages

### Patch Changes

-   Updated dependencies [59d90b2]
    -   @wallet-standard/app@1.0.0
    -   @wallet-standard/base@1.0.0
    -   @wallet-standard/features@1.0.0
    -   @wallet-standard/wallet@1.0.0
