import type { EventsFeature } from '@wallet-standard/features';
import type { Wallet } from '@wallet-standard/standard';
import type { FC, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import { getWalletProperties, WalletContext } from './useWallet.js';

/** TODO: docs */
export interface WalletProviderProps {
    children: NonNullable<ReactNode>;
}

/** TODO: docs */
export function hasEventsFeature(features: Wallet['features']): features is EventsFeature {
    return 'standard:events' in features;
}

/** TODO: docs */
export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [{ version, name, icon, chains, features, accounts }, setWalletProperties] = useState(
        getWalletProperties(wallet)
    );

    // When the wallet changes, set properties and listen for changes.
    useEffect(() => setWalletProperties(getWalletProperties(wallet)), [wallet]);

    useEffect(() => {
        if (hasEventsFeature(features)) {
            features['standard:events'].on('change', () => setWalletProperties(getWalletProperties(wallet)));
        }
    }, [wallet, features]);

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
