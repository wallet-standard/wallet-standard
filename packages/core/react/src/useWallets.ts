import { Wallet, WalletAccount } from '@solana/wallet-standard';
import { createContext, useContext } from 'react';

export interface WalletsContextState<Account extends WalletAccount> {
    wallets: ReadonlyArray<Wallet<Account>>;
}

const EMPTY_ARRAY: ReadonlyArray<never> = [] as const;
const DEFAULT_CONTEXT: WalletsContextState<never> = {
    wallets: EMPTY_ARRAY,
};
Object.defineProperty(DEFAULT_CONTEXT, 'wallets', {
    get() {
        console.error(constructMissingProviderErrorMessage('wallets'));
        return EMPTY_ARRAY;
    },
});

function constructMissingProviderErrorMessage(valueName: string) {
    return (
        'You have tried to access `' +
        valueName +
        '` on a WalletsContext without providing one. ' +
        'Make sure to render a WalletsProvider as an ancestor of the component that calls `useWallets`.'
    );
}

export const WalletsContext = createContext(DEFAULT_CONTEXT as WalletsContextState<any>);

export function useWallets<Account extends WalletAccount>(): WalletsContextState<Account> {
    return useContext(WalletsContext);
}
