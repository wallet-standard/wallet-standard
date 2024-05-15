---
'@wallet-standard/errors': patch
'@wallet-standard/ui-core': patch
'@wallet-standard/core': major
---

Introduced the `UiWallet` and `UiWalletAccount` data structures. These act both as descriptions of Wallet Standard wallets and accounts, as well as ‘handles’ to the underlying `Wallet` and `WalletAccount` objects in the registry.
