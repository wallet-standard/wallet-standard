# `@wallet-standard/ui-compare`

This package includes types and functions useful for comparing wallet accounts to determine if they represent the same account in the same wallet.

## Functions

### `getUiWalletAccountStorageKey()`

Produces a stable string that can be used to uniquely identify a `UiWalletAccount`.

You can use this to identify a list item when rendering a list of accounts, or as a way to store your app's last selected account as a string in browser storage.

```ts
// When selecting an account in the UI
function onSelectAccount(account: UiWalletAccount) {
    window.localStorage.set('lastSelectedAccount', getUiWalletAccountStorageKey(account));
}

// Later, when reloading the app
const savedAccountKey = window.localStorage.get('lastSelectedAccount');
const selectedAccount = wallets
    .flatMap(({ accounts }) => accounts)
    .find((account) => savedAccountKey === getUiWalletAccountStorageKey(account));
```

### `uiWalletAccountsAreSame()`

Given two `UiWalletAccount` objects, this method will tell you if they represent the same underlying `WalletAccount`.

```ts
const previousSelectedWalletAccount = usePrev(selectedWalletAccount);
useEffect(() => {
    if (!uiWalletsAccountsAreSame(selectedWalletAccount, previousSelectedWalletAccount)) {
        console.log('A new account was selected!');
    }
}, [previousSelectedWalletAccount, selectedWalletAccount]);
```

`UiWalletAccount` objects are meant to be used in client apps to render UI; they are not the _actual_ underlying `WalletAccount` objects. In particular, they can change over time and you can not presume that two `UiWalletAccount` objects will be referentially equal &ndash; even though they represent the &lsquo;same&rsquo; account.

> [!WARNING]
> It is insufficient to compare two accounts on the basis of their addresses; it's possible for two different wallets to be configured with the same account. Use this method whenever you need to know for sure that two `UiWalletAccount` objects represent the same address _and_ belong to the same underlying `Wallet`.

### `uiWalletAccountBelongsToUiWallet()`

Given a `UiWalletAccount`, this method will tell you if the account belongs to a specific `UiWallet`.

> [!WARNING]
> It's possible for two different wallets to be configured with the same account. Use this method whenever you need to know for sure that a `UiWalletAccount` belongs to a particular `UiWallet`.
