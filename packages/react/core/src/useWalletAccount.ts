import type { WalletAccount } from '@wallet-standard/base';
import { createContext, useContext } from 'react';
import { createDefaultContext } from './context.js';

/** TODO: docs */
export interface WalletAccountContextState {
    walletAccount: WalletAccount | null;
    setWalletAccount(wallet: WalletAccount | null): void;
}

const DEFAULT_WALLET_ACCOUNT_STATE: Readonly<WalletAccountContextState> = {
    walletAccount: null,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setWalletAccount() {},
} as const;

const DEFAULT_WALLET_ACCOUNT_CONTEXT = createDefaultContext('WalletAccount', DEFAULT_WALLET_ACCOUNT_STATE);

/** TODO: docs */
export const WalletAccountContext = createContext(DEFAULT_WALLET_ACCOUNT_CONTEXT);

/** TODO: docs */
export function useWalletAccount(): WalletAccountContextState {
    return useContext(WalletAccountContext);
}
