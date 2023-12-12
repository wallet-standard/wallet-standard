# @wallet-standard/react-core

## 0.1.5

### Patch Changes

-   6a969b5: Reimplement the `useWallets()` hook with `useSyncExternalStore`
-   34f789e: Eliminated `WalletsProvider` in favor of `useWallets()`. There is no need to encapsulate the corpus of wallets to a subtree context because the wallet list is always global to the `Window` object.
-   Updated dependencies [43b2f82]
    -   @wallet-standard/app@1.0.2

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
