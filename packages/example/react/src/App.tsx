import { GlowWalletAdapter } from '@solana/wallet-adapter-glow';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { useWallets, WalletProvider, WalletsProvider } from '@wallet-standard/react';
import { registerWalletAdapter } from '@wallet-standard/solana-wallet-adapter';
import { CHAIN_SOLANA_MAINNET } from '@wallet-standard/util';
import type { FC, ReactNode } from 'react';
import React, { useEffect } from 'react';

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
