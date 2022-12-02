# Wallet Standard

The Wallet Standard is a set of interfaces and conventions designed to improve the user experience and developer experience of wallets and applications for any blockchain.

## Code

- [`Wallet` and `WalletAccount`](https://github.com/wallet-standard/wallet-standard/tree/master/packages/core/base/src/wallet.ts) interfaces
- Global [`window`](https://github.com/wallet-standard/wallet-standard/tree/master/packages/core/base/src/window.ts) events
- Wallet [`registerWallet`](https://github.com/wallet-standard/wallet-standard/tree/master/packages/core/wallet/src/register.ts) function
- App [`getWallets`](https://github.com/wallet-standard/wallet-standard/tree/master/packages/core/app/src/wallets.ts) function
- [Example](https://github.com/wallet-standard/wallet-standard/tree/master/packages/example/wallets/src/window.ts) of how wallets attach to the window

## Extensions

See [EXTENSIONS](https://github.com/wallet-standard/wallet-standard/tree/master/EXTENSIONS.md) for chain-specific extensions to the Wallet Standard.

## Design

See [DESIGN](https://github.com/wallet-standard/wallet-standard/tree/master/DESIGN.md) for the original design principles of the Wallet Standard. It's somewhat outdated with respect to the code, but generally captures its purpose.

## Build

See [BUILD](https://github.com/wallet-standard/wallet-standard/tree/master/BUILD.md) for instructions to build the repo from source.
