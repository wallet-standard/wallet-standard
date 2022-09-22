import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { GlowWalletAdapter } from '@solana/wallet-adapter-glow';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { useStandardWalletAdapters } from '@wallet-standard/solana-wallet-adapter-react';
import type { FC, ReactNode } from 'react';
import React, { useMemo } from 'react';
import { RequestAirdrop } from './RequestAirdrop.js';
import { SendTransaction } from './SendTransaction.js';
import { SignMessage } from './SignMessage.js';

export const App: FC = () => {
    return (
        <Context>
            <Content />
        </Context>
    );
};

const Context: FC<{ children: ReactNode }> = ({ children }) => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(() => [new PhantomWalletAdapter(), new GlowWalletAdapter({ network })], [network]);

    const adapters = useStandardWalletAdapters(wallets);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={adapters} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

const Content: FC = () => {
    return (
        <div>
            <WalletMultiButton />
            <br />
            <RequestAirdrop />
            <br />
            <SendTransaction />
            <br />
            <SignMessage />
            <br />
        </div>
    );
};
