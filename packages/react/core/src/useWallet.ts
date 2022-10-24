import type { Wallet } from '@wallet-standard/base';
import { createContext, useContext } from 'react';
import { createDefaultContext, EMPTY_ARRAY, EMPTY_OBJECT, EMPTY_STRING } from './context.js';

/** TODO: docs */
export interface WalletContextState extends Wallet {
    wallet: Wallet | null;
    setWallet(wallet: Wallet | null): void;
}

const DEFAULT_WALLET_PROPERTIES: Readonly<Wallet> = {
    version: '1.0.0',
    name: EMPTY_STRING,
    icon: `data:image/png;base64,`,
    chains: EMPTY_ARRAY,
    features: EMPTY_OBJECT,
    accounts: EMPTY_ARRAY,
} as const;

const DEFAULT_WALLET_STATE: Readonly<WalletContextState> = {
    wallet: null,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setWallet() {},
    ...DEFAULT_WALLET_PROPERTIES,
} as const;

const DEFAULT_WALLET_CONTEXT = createDefaultContext('Wallet', DEFAULT_WALLET_STATE);

/** TODO: docs */
export const WalletContext = createContext(DEFAULT_WALLET_CONTEXT);

/** TODO: docs */
export function useWallet(): WalletContextState {
    return useContext(WalletContext);
}

/** @internal */
export function getWalletProperties(wallet: Wallet | null): Readonly<Wallet> {
    return wallet
        ? {
              version: wallet.version,
              name: wallet.name,
              icon: wallet.icon,
              chains: wallet.chains,
              features: wallet.features,
              accounts: wallet.accounts,
          }
        : DEFAULT_WALLET_PROPERTIES;
}
