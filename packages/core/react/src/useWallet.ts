import type { Wallet, WalletAccount, WalletProperties } from '@wallet-standard/standard';
import { createContext, useContext } from 'react';
import { createDefaultContext, EMPTY_ARRAY, EMPTY_STRING } from './context';

/** TODO: docs */
export interface WalletContextState<Account extends WalletAccount> extends WalletProperties<Account> {
    wallet: Wallet<Account> | undefined;
    setWallet(wallet: Wallet<Account> | undefined): void;
    connect: Wallet<Account>['connect'];
    connecting: boolean;
}

const DEFAULT_WALLET_PROPERTIES: Readonly<WalletProperties<WalletAccount>> = {
    version: '1.0.0',
    name: EMPTY_STRING,
    icon: EMPTY_STRING,
    chains: EMPTY_ARRAY,
    features: EMPTY_ARRAY,
    extensions: EMPTY_ARRAY,
    accounts: EMPTY_ARRAY,
    hasMoreAccounts: false,
} as const;

const DEFAULT_WALLET_STATE: Readonly<WalletContextState<WalletAccount>> = {
    wallet: undefined,
    setWallet() {},
    connecting: false,
    async connect() {
        return {
            accounts: EMPTY_ARRAY,
            hasMoreAccounts: false,
        };
    },
    ...DEFAULT_WALLET_PROPERTIES,
} as const;

const DEFAULT_WALLET_CONTEXT = createDefaultContext('Wallet', DEFAULT_WALLET_STATE);

/** TODO: docs */
export const WalletContext = createContext(DEFAULT_WALLET_CONTEXT);

/** TODO: docs */
export function useWallet<Account extends WalletAccount>(): WalletContextState<Account> {
    return useContext(WalletContext) as WalletContextState<Account>;
}

/** @internal */
export function getWalletProperties(
    wallet: Wallet<WalletAccount> | undefined
): Readonly<WalletProperties<WalletAccount>> {
    return wallet
        ? {
              version: wallet.version,
              name: wallet.name,
              icon: wallet.icon,
              chains: wallet.chains,
              features: wallet.features,
              extensions: wallet.extensions,
              accounts: wallet.accounts,
              hasMoreAccounts: wallet.hasMoreAccounts,
          }
        : DEFAULT_WALLET_PROPERTIES;
}
