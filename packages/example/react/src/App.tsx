import { GlowWalletAdapter } from '@solana/wallet-adapter-glow';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { registerWalletAdapter, SOLANA_MAINNET_CHAIN } from '@solana/wallet-standard';
import { useWallets } from '@wallet-standard/react';
import type { FC } from 'react';
import React, { useEffect } from 'react';

export const App: FC = () => {
    useEffect(() => {
        const adapters = [new PhantomWalletAdapter(), new GlowWalletAdapter()];
        const destructors = adapters.map((adapter) => registerWalletAdapter(adapter, SOLANA_MAINNET_CHAIN));
        return () => destructors.forEach((destroy) => destroy());
    }, []);
    return <Content />;
};

const Content: FC = () => {
    const wallets = useWallets();
    return (
        <ul>
            {wallets.map((wallet, index) => (
                <li key={index}>{wallet.name}</li>
            ))}
        </ul>
    );
};
