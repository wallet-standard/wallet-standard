import { Wallet, WalletAccount } from '@solana/wallet-standard';
import { createContext, useContext } from 'react';

export interface WalletContextState<Account extends WalletAccount> {
    wallet: Wallet<Account> | undefined;
    setWallet(wallet: Wallet<Account> | undefined): void;
    accounts: Wallet<Account>['accounts'];
    chains: Wallet<Account>['chains'];
    connecting: boolean;
    connect: Wallet<Account>['connect'];
}

const EMPTY_ARRAY: ReadonlyArray<never> = [] as const;
const DEFAULT_CONTEXT: WalletContextState<never> = {
    wallet: undefined,
    setWallet() {},
    accounts: EMPTY_ARRAY,
    chains: EMPTY_ARRAY,
    connecting: false,
    async connect() {
        return {
            accounts: EMPTY_ARRAY,
            hasMoreAccounts: false,
        };
    },
};
Object.defineProperty(DEFAULT_CONTEXT, 'wallet', {
    get() {
        console.error(constructMissingProviderErrorMessage('wallet'));
        return EMPTY_ARRAY;
    },
});

function constructMissingProviderErrorMessage(valueName: string) {
    return (
        'You have tried to access `' +
        valueName +
        '` on a WalletContext without providing one. ' +
        'Make sure to render a WalletProvider as an ancestor of the component that calls `useWallet`.'
    );
}

export const WalletContext = createContext(DEFAULT_CONTEXT as WalletContextState<any>); // FIXME: any is a hack

export function useWallet<Account extends WalletAccount>(): WalletContextState<Account> {
    return useContext(WalletContext);
}
