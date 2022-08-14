import { WalletProvider as BaseWalletProvider, WalletProviderProps } from '@solana/wallet-adapter-react';
import { initialize } from '@wallet-standard/app';
import { StandardWalletAdapter } from '@wallet-standard/solana-wallet-adapter';
import {
    SignAndSendTransactionFeature,
    SignMessageFeature,
    SignTransactionFeature,
    WalletAccount,
} from '@wallet-standard/standard';
import type { FC } from 'react';
import React, { useEffect, useMemo, useState } from 'react';

type Account = WalletAccount & {
    features: SignAndSendTransactionFeature | SignTransactionFeature | SignMessageFeature;
};

export const WalletProvider: FC<WalletProviderProps> = ({
    children,
    wallets,
    autoConnect = false,
    onError,
    localStorageKey = 'walletName',
}) => {
    // Start with the adapters provided by the app.
    const [adapters, setAdapters] = useState(() => wallets);

    useEffect(() => {
        const destructors: (() => void)[] = [];
        const wallets = initialize<Account>();
        const registered = wallets.get();

        // TODO: filter registered wallets by feature support

        // Add an adapter for every standard wallet that has been registered already.
        setAdapters((adapters) => [
            ...registered.map((wallet) => new StandardWalletAdapter<Account>({ wallet })),
            // Filter out adapters with the same name as registered wallets.
            ...adapters.filter((adapter) => registered.some((wallet) => wallet.name === adapter.name)),
        ]);

        // Add an event listener to add adapters for wallets that are registered after this point.
        destructors.push(
            wallets.on('register', (registered) =>
                setAdapters((adapters) => [
                    ...registered.map((wallet) => new StandardWalletAdapter<Account>({ wallet })),
                    // Filter out adapters with the same name as registered wallets.
                    ...adapters.filter((adapter) => registered.some((wallet) => wallet.name === adapter.name)),
                ])
            )
        );

        // Add an event listener to remove any adapters for wallets that are unregistered after this point.
        destructors.push(
            wallets.on('unregister', (unregistered) =>
                setAdapters((adapters) =>
                    // Filter out adapters that have the same name as unregistered wallets.
                    adapters.filter((adapter) =>
                        unregistered.some((unregistered) => unregistered.name === adapter.name)
                    )
                )
            )
        );

        return () => destructors.forEach((destroy) => destroy());
    }, []);

    return (
        <BaseWalletProvider
            wallets={adapters}
            autoConnect={autoConnect}
            onError={onError}
            localStorageKey={localStorageKey}
        >
            {children}
        </BaseWalletProvider>
    );
};
