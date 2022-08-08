import { WalletAccount } from '@solana/wallet-standard';
import { initialize } from '@solana/wallet-standard-app';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { WalletsContext } from './useWallets';

export interface WalletsProviderProps {
    children: NonNullable<ReactNode>;
}

export const WalletsProvider: FC<WalletsProviderProps> = <Account extends WalletAccount>({
    children,
}: WalletsProviderProps) => {
    // Synchronously get the wallets that have registered already so that they can be accessed on the first render.
    const [wallets, setWallets] = useState(() => initialize<Account>().get());

    useEffect(() => {
        const destructors: (() => void)[] = [];
        const wallets = initialize<Account>();

        // Get and set the wallets that have been registered already, in case they changed since the state initializer.
        setWallets(wallets.get());

        // Add an event listener to add any wallets that are registered after this point.
        destructors.push(wallets.on('register', (registered) => setWallets((wallets) => wallets.concat(registered))));

        // Add an event listener to remove any wallets that are unregistered after this point.
        destructors.push(
            wallets.on('unregister', (unregistered) =>
                setWallets((wallets) => wallets.filter((wallet) => unregistered.includes(wallet)))
            )
        );

        return () => destructors.forEach((destroy) => destroy());
    }, []);

    return <WalletsContext.Provider value={{ wallets }}>{children}</WalletsContext.Provider>;
};
