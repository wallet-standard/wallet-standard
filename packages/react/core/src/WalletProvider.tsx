import type { Wallet } from '@wallet-standard/base';
import type { StandardEventsFeature } from '@wallet-standard/features';
import { getFeatureGuardFunction, StandardEvents } from '@wallet-standard/features';
import type { FC, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import { getWalletProperties, WalletContext } from './useWallet.js';

/** TODO: docs */
export interface WalletProviderProps {
    children: NonNullable<ReactNode>;
}

/** TODO: docs */
export const hasEventsFeature: ReturnType<
    typeof getFeatureGuardFunction<StandardEventsFeature, typeof StandardEvents>
> = /*#__PURE__*/ getFeatureGuardFunction(StandardEvents);

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
        if (wallet && hasEventsFeature(wallet))
            return wallet.features[StandardEvents].on('change', (properties) =>
                setWalletProperties((currentProperties) => ({ ...currentProperties, ...properties }))
            );
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
