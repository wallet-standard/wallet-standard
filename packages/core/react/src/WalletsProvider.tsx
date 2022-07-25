import { initialize, Wallet, WalletAccount } from '@solana/wallet-standard';
import React, { FC, ReactElement, ReactNode, useEffect, useState } from 'react';
import { WalletContext } from './useWallets';

export interface WalletsProviderProps {
    children: NonNullable<ReactNode>;
}

export const WalletsProvider: FC<WalletsProviderProps> = <A extends WalletAccount>({
    children,
}: WalletsProviderProps) => {
    const [wallets, setWallets] = useState<Wallet<A>[]>([]);

    useEffect(() => {
        let unsubscribe = () => {};

        const commands = initialize<A>();

        commands.push({
            method: 'get',
            callback: setWallets,
        });

        commands.push({
            method: 'on',
            event: 'register',
            listener(...newWallets) {
                setWallets((wallets) => [...wallets, ...newWallets]);
            },
            callback(newUnsubscribe) {
                unsubscribe = newUnsubscribe;
            },
        });

        return () => unsubscribe();
    }, []);

    return <WalletContext.Provider value={{ wallets }}>{children}</WalletContext.Provider>;
};
