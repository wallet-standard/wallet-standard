import { getWallets } from '@wallet-standard/app';
import type { Wallet } from '@wallet-standard/base';
import { useMemo, useState, useEffect } from 'react';

/** TODO: docs */
export function useWallets(): readonly Wallet[] {
    // Initialize `window.navigator.wallets` and obtain a synchronous API.
    const { get, on } = useMemo(() => getWallets(), []);

    // Synchronously get the wallets that have registered already so that they can be accessed on the first render.
    const [wallets, setWallets] = useState(() => get());

    useEffect(() => {
        const destructors: (() => void)[] = [];

        // TODO: figure out if this can ever actually happen
        // FIXME: this can definitely happen, refactor similar to @solana/wallet-standard-wallet-adapter-react
        // Get and set the wallets that have been registered already, in case they changed since the state initializer.
        setWallets(get());

        // Add an event listener to add any wallets that are registered after this point.
        destructors.push(on('register', () => setWallets(get())));

        // Add an event listener to remove any wallets that are unregistered after this point.
        destructors.push(on('unregister', () => setWallets(get())));

        return () => destructors.forEach((destroy) => destroy());
    }, [get, on]);

    return wallets;
}
