import { WalletProvider as BaseWalletProvider, WalletProviderProps } from '@solana/wallet-adapter-react';
import { initialize } from '@wallet-standard/app';
import { isStandardWalletAdapterCompatibleWallet, StandardWalletAdapter } from '@wallet-standard/solana-wallet-adapter';
import { WalletAccount } from '@wallet-standard/standard';
import type { FC } from 'react';
import React, { useEffect, useState } from 'react';

export const WalletProvider: FC<WalletProviderProps> = ({
    children,
    wallets,
    autoConnect = false,
    onError,
    localStorageKey = 'walletName',
}) => {
    // Start with the adapters provided by the app.
    const [adapters, setAdapters] = useState(wallets);

    useEffect(() => {
        const wallets = initialize<WalletAccount>();
        // Get wallets that have been registered already that are able to be wrapped with adapters.
        const filtered = wallets.get().filter(isStandardWalletAdapterCompatibleWallet);

        // Add an adapter for standard wallets that have been registered already.
        if (filtered.length) {
            setAdapters((adapters) => {
                return [
                    ...filtered.map((wallet) => new StandardWalletAdapter({ wallet })),
                    // Filter out adapters with the same name as registered standard wallets.
                    ...adapters.filter((adapter) => filtered.some((wallet) => wallet.name === adapter.name)),
                ];
            });
        }

        const destructors = [
            // Add an event listener to add adapters for standard wallets that are registered after this point.
            wallets.on('register', (registered) => {
                const filtered = registered.filter(isStandardWalletAdapterCompatibleWallet);
                if (filtered.length) {
                    setAdapters((adapters) => [
                        ...filtered.map((wallet) => new StandardWalletAdapter({ wallet })),
                        // Filter out adapters with the same name as registered standard wallets.
                        ...adapters.filter((adapter) => filtered.some((wallet) => wallet.name === adapter.name)),
                    ]);
                }
            }),
            // Add an event listener to remove any adapters for wallets that are unregistered after this point.
            wallets.on('unregister', (unregistered) => {
                const filtered = unregistered.filter(isStandardWalletAdapterCompatibleWallet);
                if (filtered.length) {
                    setAdapters((adapters) =>
                        // Filter out adapters with the same name as unregistered wallets.
                        adapters.filter((adapter) => filtered.some((wallet) => wallet.name === adapter.name))
                    );
                }
            }),
        ];

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
