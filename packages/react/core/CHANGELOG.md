# @wallet-standard/react-core

## 1.0.0

### Major Changes

-   371213e: A `useWallets()` hook you can use to obtain an array of `UiWallet` objects that represent the currently registered Wallet Standard wallets. You can render these wallets in the UI of your application using the `name` and `icon` properties within, you can enumerate the `UiWalletAccount` objects authorized for the current domain through the `accounts` property, and you can use the `UiWallet` itself with compatible hooks, to materialize wallet features and more.
-   371213e: Release 1.0.0 of previously unreleased packages
-   371213e: Replaced the feature context providers with two hooks: `useConnect()` and `useDisconnect()`

### Patch Changes

-   371213e: The `useWallets()` hook will now cause a re-render any time a wallet's `'change'` event fires
-   371213e: Reimplement the `useWallets()` hook with `useSyncExternalStore`
-   371213e: Updated to TypeScript 5, latest ESLint plugins, Prettier 3
-   371213e: Eliminated `WalletsProvider` in favor of `useWallets()`. There is no need to encapsulate the corpus of wallets to a subtree context because the wallet list is always global to the `Window` object.
-   Updated dependencies [371213e]
-   Updated dependencies [371213e]
-   Updated dependencies [371213e]
-   Updated dependencies [371213e]
-   Updated dependencies [371213e]
-   Updated dependencies [371213e]
-   Updated dependencies [371213e]
    -   @wallet-standard/app@1.1.0
    -   @wallet-standard/experimental-features@0.2.0
    -   @wallet-standard/errors@0.1.0
    -   @wallet-standard/base@1.1.0
    -   @wallet-standard/features@1.1.0
    -   @wallet-standard/ui@1.0.0
    -   @wallet-standard/ui-registry@1.0.0

## 0.1.4

### Patch Changes

-   Updated dependencies [6cac3ca]
    -   @wallet-standard/features@1.0.3

## 0.1.3

### Patch Changes

-   Updated dependencies [41add01]
    -   @wallet-standard/features@1.0.2

## 0.1.2

### Patch Changes

-   6e11316: Prevent `WalletsContext.Provider` from rerendering when `wallets` does not change. Fewer spurious rerenders means better performance.

## 0.1.1

### Patch Changes

-   Updated dependencies [1eefb9f]
    -   @wallet-standard/app@1.0.1
    -   @wallet-standard/base@1.0.1
    -   @wallet-standard/features@1.0.1
    -   @wallet-standard/experimental-features@0.1.1

## 0.1.0

### Minor Changes

-   59d90b2: Release v1.0.0 of core packages, and v0.1.0 of other packages

### Patch Changes

-   Updated dependencies [59d90b2]
    -   @wallet-standard/app@1.0.0
    -   @wallet-standard/base@1.0.0
    -   @wallet-standard/features@1.0.0
    -   @wallet-standard/experimental-features@0.1.0
