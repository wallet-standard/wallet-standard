---
"@wallet-standard/example-dapp": patch
"@wallet-standard/example-react": patch
"@wallet-standard/react-core": patch
---

Eliminated `WalletsProvider` in favor of `useWallets()`. There is no need to encapsulate the corpus of wallets to a subtree context because the wallet list is always global to the `Window` object.
