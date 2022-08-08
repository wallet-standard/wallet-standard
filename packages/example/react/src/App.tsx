import { GlowWalletAdapter } from '@solana/wallet-adapter-glow';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { useWallets, WalletProvider, WalletsProvider } from '@solana/wallet-standard-react';
import { registerWalletAdapter } from '@solana/wallet-standard-solana-wallet-adapter';
import { CHAIN_SOLANA_MAINNET } from '@solana/wallet-standard-util';
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
        const adapters = [new PhantomWalletAdapter(), new GlowWalletAdapter()];
        const destructors = adapters.map((adapter) => registerWalletAdapter(adapter, CHAIN_SOLANA_MAINNET));
        return () => destructors.forEach((destroy) => destroy());
    }, []);

    return (
        <WalletsProvider>
            <WalletProvider>{children}</WalletProvider>
        </WalletsProvider>
    );
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
