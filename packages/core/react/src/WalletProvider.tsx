import type { Wallet } from '@wallet-standard/standard';
import type { FC, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import { getWalletProperties, WalletContext } from './useWallet.js';

/** TODO: docs */
export interface WalletProviderProps {
    children: NonNullable<ReactNode>;
}

/** TODO: docs */
export const WalletProvider: FC<WalletProviderProps> = ({ children }: WalletProviderProps) => {
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [{ version, name, icon, chains, features, accounts }, setWalletProperties] = useState(
        getWalletProperties(wallet)
    );

    // When the wallet changes, set properties and listen for changes
    useEffect(() => {
        setWalletProperties(getWalletProperties(wallet));
        if (wallet) return wallet.on('standard:change', () => setWalletProperties(getWalletProperties(wallet)));
    }, [wallet]);

    return (
        <WalletContext.Provider
            value={{
                wallet,
                setWallet,
                version,
                name,
                icon,
                chains,
                features,
                accounts,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};
