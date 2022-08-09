import { Wallet, WalletAccount, WalletProperties } from '@solana/wallet-standard';
import { createContext, useContext } from 'react';
import { createDefaultContext, EMPTY_ARRAY } from './context';

export interface WalletContextState<Account extends WalletAccount> {
    wallet: Wallet<Account> | undefined;
    setWallet(wallet: Wallet<Account> | undefined): void;
    properties: WalletProperties<Account> | undefined;
    connecting: boolean;
    connect: Wallet<Account>['connect'];
}

const DEFAULT_CONTEXT: WalletContextState<WalletAccount> = createDefaultContext('Wallet', {
    wallet: undefined,
    setWallet() {},
    properties: undefined,
    connecting: false,
    async connect() {
        return {
            accounts: EMPTY_ARRAY,
            hasMoreAccounts: false,
        };
    },
});

export const WalletContext = createContext(DEFAULT_CONTEXT);

export function useWallet<Account extends WalletAccount>(): WalletContextState<Account> {
    return useContext(WalletContext) as WalletContextState<Account>;
}
