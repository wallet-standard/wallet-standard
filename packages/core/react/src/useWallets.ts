import { createContext, useContext } from 'react';
import { Wallet, WalletAccount } from '@solana/wallet-standard';

export interface WalletsContextState<A extends WalletAccount> {
    wallets: Wallet<A>[];
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

export function useWallets<A extends WalletAccount>(): WalletsContextState<A> {
    return useContext<WalletsContextState<A>>(WalletContext as any);
}
