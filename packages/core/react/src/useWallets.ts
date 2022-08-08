import { Wallet, WalletAccount } from '@solana/wallet-standard';
import { createContext, useContext } from 'react';
import { createDefaultContext, EMPTY_ARRAY } from './context';

export interface WalletsContextState<Account extends WalletAccount> {
    wallets: ReadonlyArray<Wallet<Account>>;
}

const DEFAULT_CONTEXT: WalletsContextState<WalletAccount> = createDefaultContext('Wallets', {
    wallets: EMPTY_ARRAY,
});

export const WalletsContext = createContext(DEFAULT_CONTEXT);

export function useWallets<Account extends WalletAccount>(): WalletsContextState<Account> {
    return useContext(WalletsContext) as WalletsContextState<Account>;
}
