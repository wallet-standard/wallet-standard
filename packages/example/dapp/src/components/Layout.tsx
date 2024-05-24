import { Flex, Section, Theme } from '@radix-ui/themes';
import React from 'react';
import { Outlet } from 'react-router-dom';

import { Nav } from './Nav';
import { SelectedWalletAccountContextProvider } from '../context/SelectedWalletAccountContext';

import { RpcContext } from '../context/RpcContext';
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/web3.js-experimental';

import '@radix-ui/themes/styles.css';

const rpc = {
    rpc: createSolanaRpc('https://api.devnet.solana.com'),
    rpcSubscriptions: createSolanaRpcSubscriptions('wss://api.devnet.solana.com'),
};

export function Layout() {
    return (
        <Theme>
            <Flex direction="column">
                <SelectedWalletAccountContextProvider>
                    <RpcContext.Provider value={rpc}>
                        <Nav />
                        <Section>
                            <Outlet />
                        </Section>
                    </RpcContext.Provider>
                </SelectedWalletAccountContextProvider>
            </Flex>
        </Theme>
    );
}
