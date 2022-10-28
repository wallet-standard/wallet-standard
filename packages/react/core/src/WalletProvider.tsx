import type { Wallet } from '@wallet-standard/base';
import type { EventsFeature } from '@wallet-standard/features';
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
    const [{ version, name, icon, chains, features, accounts }, setWalletProperties] = useState(() =>
        getWalletProperties(wallet)
    );

    // When the wallet changes, set properties.
    useEffect(() => setWalletProperties(getWalletProperties(wallet)), [wallet]);

    // When the features change, listen for property changes if the wallet supports it.
    useEffect(() => {
        if (hasEventsFeature(features))
            return features['standard:events'].on('change', (properties) =>
                setWalletProperties((currentProperties) => ({ ...currentProperties, ...properties }))
            );
    }, [features]);

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
