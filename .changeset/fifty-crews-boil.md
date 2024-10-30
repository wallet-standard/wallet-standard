---
"@wallet-standard/app": patch
---

`Wallets::get()` now returns the same array object unless the wallets have changed, to make downstream optimizations based on `===` possible.
