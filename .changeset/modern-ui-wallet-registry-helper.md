---
"@wallet-standard/react-core": patch
"@wallet-standard/ui-compare": patch
"@wallet-standard/ui-features": patch
"@wallet-standard/ui-registry": minor
---

@wallet-standard/ui-registry exports are renamed to drop the _DO_NOT_USE_OR_YOU_WILL_BE_FIRED suffix (e.g. getWalletForHandle, registerWalletHandle). Depending on this package is itself the opt-in for UI library authors, so the in-name warning was redundant. The suffixed names remain as @deprecated aliases.
