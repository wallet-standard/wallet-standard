---
"@wallet-standard/react-core": patch
---

Prevent `WalletsContext.Provider` from rerendering when `wallets` does not change. Fewer spurious rerenders means better performance.
