import { GlowWalletAdapter } from '@solana/wallet-adapter-glow';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
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
        registerWalletAdapter(new PhantomWalletAdapter(), () => {}); // FIXME: unregister if adapted wallet supports standard
        registerWalletAdapter(new GlowWalletAdapter(), () => {}); // FIXME: unregister if adapted wallet supports standard
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
