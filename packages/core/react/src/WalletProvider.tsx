import { Wallet, WalletAccount } from '@solana/wallet-standard';
import React, { FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { WalletContext } from './useWallet';

export interface WalletProviderProps {
    children: NonNullable<ReactNode>;
    onError?: (error: Error) => void;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children, onError }: WalletProviderProps) => {
    const [wallet, setWallet] = useState<Wallet<WalletAccount>>();
    const [accounts, setAccounts] = useState<ReadonlyArray<WalletAccount>>([]);
    const [chains, setChains] = useState<ReadonlyArray<string>>([]);

    // If the window is closing or reloading, ignore events from the wallet
    const isUnloading = useRef(false);
    useEffect(() => {
        function beforeUnload() {
            isUnloading.current = true;
        }

        window.addEventListener('beforeunload', beforeUnload);
        return () => window.removeEventListener('beforeunload', beforeUnload);
    }, [isUnloading]);

    // When the wallet changes, set the accounts and listen for changes to the accounts
    useEffect(() => {
        if (wallet) {
            setAccounts(wallet.accounts);
            return wallet.on('accountsChanged', () => setAccounts(wallet.accounts));
        } else {
            setAccounts([]);
        }
    }, [wallet]);

    // When the wallet changes, set the chains and listen for changes to the chains
    useEffect(() => {
        if (wallet) {
            setChains(wallet.chains);
            return wallet.on('chainsChanged', () => setChains(wallet.chains));
        } else {
            setChains([]);
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
        <WalletContext.Provider value={{ wallet, setWallet, accounts, chains, connecting, connect }}>
            {children}
        </WalletContext.Provider>
    );
};
