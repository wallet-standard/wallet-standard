import { Wallet, WalletAccount } from '@solana/wallet-standard';
import { createContext, useContext } from 'react';

export interface WalletsContextState<Account extends WalletAccount> {
    wallets: Wallet<Account>[];
}

const EMPTY_ARRAY: ReadonlyArray<never> = [] as const;

const DEFAULT_CONTEXT: WalletsContextState<never> = {
    wallets: [],
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
        '` on a WalletContext without providing one. ' +
        'Make sure to render a WalletProvider as an ancestor of the component that calls `useWallets`.'
    );
}

export const WalletContext = createContext(DEFAULT_CONTEXT as WalletsContextState<WalletAccount>);

export function useWallets<Account extends WalletAccount>(): WalletsContextState<Account> {
    return useContext<WalletsContextState<Account>>(WalletContext as any);
}
