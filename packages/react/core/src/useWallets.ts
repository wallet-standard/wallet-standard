import type { Wallet } from '@wallet-standard/base';
import { createContext, useContext } from 'react';
import { createDefaultContext, EMPTY_ARRAY } from './context.js';

/** TODO: docs */
export interface WalletsContextState {
    wallets: ReadonlyArray<Wallet>;
}

const DEFAULT_WALLETS_STATE: Readonly<WalletsContextState> = { wallets: EMPTY_ARRAY } as const;

const DEFAULT_WALLETS_CONTEXT = createDefaultContext('Wallets', DEFAULT_WALLETS_STATE);

/** TODO: docs */
export const WalletsContext = createContext(DEFAULT_WALLETS_CONTEXT);

/** TODO: docs */
export function useWallets(): WalletsContextState {
    return useContext(WalletsContext);
}
