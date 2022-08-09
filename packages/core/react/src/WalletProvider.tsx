import { Wallet, WalletAccount, WalletProperties } from '@solana/wallet-standard';
import React, { FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { WalletContext } from './useWallet';

export interface WalletProviderProps {
    children: NonNullable<ReactNode>;
    onError?: (error: Error) => void;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children, onError }: WalletProviderProps) => {
    const [wallet, setWallet] = useState<Wallet<WalletAccount>>();
    const [properties, setProperties] = useState<WalletProperties<WalletAccount>>();

    // If the window is closing or reloading, ignore events from the wallet
    const isUnloading = useRef(false);
    useEffect(() => {
        function beforeUnload() {
            isUnloading.current = true;
        }

        window.addEventListener('beforeunload', beforeUnload);
        return () => window.removeEventListener('beforeunload', beforeUnload);
    }, [isUnloading]);

    // When the wallet changes, set properties and listen for changes
    useEffect(() => {
        if (wallet) {
            setProperties({
                version: wallet.version,
                name: wallet.name,
                icon: wallet.icon,
                chains: wallet.chains,
                features: wallet.features,
                accounts: wallet.accounts,
                hasMoreAccounts: wallet.hasMoreAccounts,
            });
            return wallet.on('change', () =>
                setProperties({
                    version: wallet.version,
                    name: wallet.name,
                    icon: wallet.icon,
                    chains: wallet.chains,
                    features: wallet.features,
                    accounts: wallet.accounts,
                    hasMoreAccounts: wallet.hasMoreAccounts,
                })
            );
        } else {
            setProperties(undefined);
        }
    }, [wallet]);

    // Handle errors
    const handleError = useCallback(
        (error: Error) => {
            // Call onError unless the window is unloading
            if (!isUnloading.current) (onError || console.error)(error);
            return error;
        },
        [isUnloading, onError]
    );

    // Connect to the wallet
    const [connecting, setConnecting] = useState(false);
    const connectPromise = useRef<any>();
    const connect = useCallback<Wallet<WalletAccount>['connect']>(
        async (input) => {
            if (!wallet) throw handleError(new Error());
            // If already connecting, wait for that promise to resolve
            if (connectPromise.current) {
                try {
                    await connectPromise.current;
                } catch (error: any) {
                    // Error will already have been handled below
                }
            }

            if (!input.silent) {
                setConnecting(true);
            }
            try {
                connectPromise.current = wallet.connect(input);
                return await connectPromise.current;
            } catch (error: any) {
                throw handleError(error);
            } finally {
                if (!input.silent) {
                    setConnecting(false);
                }
                connectPromise.current = undefined;
            }
        },
        [wallet, connectPromise, handleError]
    );

    return (
        <WalletContext.Provider value={{ wallet, setWallet, properties, connecting, connect }}>
            {children}
        </WalletContext.Provider>
    );
};
