# @wallet-standard/app

## 1.0.2

### Patch Changes

-   43b2f82: `Wallets::get()` now returns the same array object unless the wallets have changed, to make downstream optimizations based on `===` possible.

## 1.0.1

### Patch Changes

-   1eefb9f: Docs and Non-breaking Changes

    ### Docs

    -   Restructured readme files
    -   Added readme files for extensions
    -   Documented `core` packages
    -   Reorganized `core` file structure

    ### Non-breaking Changes

    -   `@wallet-standard/app`
        -   Renamed `WalletsEvents` to `WalletsEventsListeners`
        -   Aliased `WalletsEvents` to `WalletsEventsListeners`
        -   Deprecated `WalletsEvents`

-   Updated dependencies [1eefb9f]
    -   @wallet-standard/base@1.0.1

## 1.0.0

### Major Changes

-   59d90b2: Release v1.0.0 of core packages, and v0.1.0 of other packages

### Patch Changes

-   Updated dependencies [59d90b2]
    -   @wallet-standard/base@1.0.0
