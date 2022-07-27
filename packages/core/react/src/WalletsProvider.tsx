import { initialize, Wallet, WalletAccount } from '@solana/wallet-standard';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { WalletContext } from './useWallets';

export interface WalletsProviderProps {
    children: NonNullable<ReactNode>;
}

export const WalletsProvider: FC<WalletsProviderProps> = <Account extends WalletAccount>({
    children,
}: WalletsProviderProps) => {
    const [wallets, setWallets] = useState<Wallet<Account>[]>(() => {
        let initialWallets: Wallet<Account>[] = [];
        const { push } = initialize<Account>();

        // Synchronously get the wallets that have registered already so that they can be accessed on the first render.
        push({
            method: 'get',
            callback(wallets) {
                initialWallets = wallets;
            },
        });

        return initialWallets;
    });

    useEffect(() => {
        let teardown = () => {};
        const { push } = initialize<Account>();

        // Get and set the wallets that have been registered already, in case they changed since the state initializer.
        push({
            method: 'get',
            callback: setWallets,
        });

        // Add an event listener to add any wallets that are registered after this point.
        push({
            method: 'on',
            event: 'register',
            listener(...newWallets) {
                setWallets((wallets) => [...wallets, ...newWallets]);
            },
            callback(off) {
                teardown = off;
            },
        });

        return () => teardown();
    }, []);

    return <WalletContext.Provider value={{ wallets }}>{children}</WalletContext.Provider>;
};
