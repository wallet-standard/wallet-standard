# @wallet-standard/experimental-features

## 0.2.0

### Minor Changes

-   cd45f09: Minor version bump to previously released packages

### Patch Changes

-   83062f5: Wherever a bytearray is required as input, you can now pass read-only instances of `Uint8Array` – namely ones without mutative methods like `fill` and `reverse`. This makes it so that Wallet Standard methods are _less_ strict about these inputs, and can accept a wider variety of them
-   d6b051e: Updated to TypeScript 5, latest ESLint plugins, Prettier 3
-   Updated dependencies [83062f5]
-   Updated dependencies [cd45f09]
-   Updated dependencies [d6b051e]
    -   @wallet-standard/base@1.1.0

## 0.1.1

### Patch Changes

-   Updated dependencies [1eefb9f]
    -   @wallet-standard/base@1.0.1

## 0.1.0

### Minor Changes

-   59d90b2: Release v1.0.0 of core packages, and v0.1.0 of other packages

### Patch Changes

-   Updated dependencies [59d90b2]
    -   @wallet-standard/base@1.0.0
