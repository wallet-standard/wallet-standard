import { initialize } from '@wallet-standard/app';
import type { FC, ReactNode } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import { WalletsContext } from './useWallets.js';

/** TODO: docs */
export interface WalletsProviderProps {
    children: NonNullable<ReactNode>;
}

/** TODO: docs */
export const WalletsProvider: FC<WalletsProviderProps> = ({ children }) => {
    // Initialize `window.navigator.wallets` and obtain a synchronous API.
    const { get, on } = useMemo(() => initialize(), []);

    // Synchronously get the wallets that have registered already so that they can be accessed on the first render.
    const [wallets, setWallets] = useState(() => get());

    useEffect(() => {
        const destructors: (() => void)[] = [];

        // Get and set the wallets that have been registered already, in case they changed since the state initializer.
        setWallets(get());

        // Add an event listener to add any wallets that are registered after this point.
        destructors.push(on('register', () => setWallets(get())));

        // Add an event listener to remove any wallets that are unregistered after this point.
        destructors.push(on('unregister', () => setWallets(get())));

        return () => destructors.forEach((destroy) => destroy());
    }, []);

    return <WalletsContext.Provider value={{ wallets }}>{children}</WalletsContext.Provider>;
};
