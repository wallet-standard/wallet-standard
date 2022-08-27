import type { Wallet, WalletAccount } from '@wallet-standard/standard';
import { createContext, useContext } from 'react';
import { createDefaultContext, EMPTY_ARRAY } from './context.js';

/** TODO: docs */
export interface WalletsContextState<Account extends WalletAccount> {
    wallets: ReadonlyArray<Wallet<Account>>;
}

const DEFAULT_WALLETS_STATE: Readonly<WalletsContextState<WalletAccount>> = { wallets: EMPTY_ARRAY } as const;

const DEFAULT_WALLETS_CONTEXT = createDefaultContext('Wallets', DEFAULT_WALLETS_STATE);

/** TODO: docs */
export const WalletsContext = createContext(DEFAULT_WALLETS_CONTEXT);

/** TODO: docs */
export function useWallets<Account extends WalletAccount>(): WalletsContextState<Account> {
    return useContext(WalletsContext) as WalletsContextState<Account>;
}
