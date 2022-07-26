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
        let teardown = () => {};

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
            callback(off) {
                teardown = off;
            },
        });

        return () => teardown();
    }, []);

    return <WalletContext.Provider value={{ wallets }}>{children}</WalletContext.Provider>;
};
