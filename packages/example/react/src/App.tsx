import { GlowWalletAdapter } from '@solana/wallet-adapter-glow';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { initialize } from '@solana/wallet-standard';
import { useWallets, WalletsProvider } from '@solana/wallet-standard-react';
import { registerWalletAdapter } from '@solana/wallet-standard-solana-wallet-adapter';
import React, { FC, ReactNode, useEffect } from 'react';

export const App: FC = () => {
    return (
        <Context>
            <Content />
        </Context>
    );
};

const Context: FC<{ children: NonNullable<ReactNode> }> = ({ children }) => {
    useEffect(() => {
        const removers: (() => void)[] = [];
        const wallets = initialize();

        const adapters = [new PhantomWalletAdapter(), new GlowWalletAdapter()];
        for (const adapter of adapters) {
            registerWalletAdapter(adapter, (unregister) => removers.push(unregister)); // FIXME: unregister if adapted wallet supports standard
        }

        return () => removers.forEach((remove) => remove());
    }, []);

    return <WalletsProvider>{children}</WalletsProvider>;
};

const Content: FC = () => {
    const { wallets } = useWallets();
    return (
        <ul>
            {wallets.map((wallet, index) => (
                <li key={index}>{wallet.name}</li>
            ))}
        </ul>
    );
};
