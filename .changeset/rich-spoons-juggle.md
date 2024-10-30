---
'@wallet-standard/experimental-features': patch
'@wallet-standard/errors': patch
'@wallet-standard/wallet': patch
'@wallet-standard/base': patch
'@wallet-standard/core': patch
---

Wherever a bytearray is required as input, you can now pass read-only instances of `Uint8Array` – namely ones without mutative methods like `fill` and `reverse`. This makes it so that Wallet Standard methods are _less_ strict about these inputs, and can accept a wider variety of them
