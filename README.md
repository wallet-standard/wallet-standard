# Wallet Standard

The Wallet Standard is a set of interfaces and conventions designed to improve the user experience and developer experience of wallets and applications for any blockchain.

## Code

- [`Wallet` and `WalletAccount`](packages/core/base/src/wallet.ts) interfaces
- Global [`window`](packages/core/base/src/window.ts) events
- Wallet [`registerWallet`](packages/core/wallet/src/register.ts) function
- App [`getWallets`](packages/core/app/src/wallets.ts) function
- [Example](packages/example/wallets/src/window.ts) of how wallets attach to the window

## Extensions

See [EXTENSIONS](EXTENSIONS.md) for chain-specific extensions to the Wallet Standard.

## Design

See [DESIGN](DESIGN.md) for the original design principles of the Wallet Standard. It's somewhat outdated with respect to the code, but generally captures its purpose.

## Build

See [BUILD](BUILD.md) for instructions to build the repo from source.
