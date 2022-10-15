import type { FC, ReactNode } from 'react';
import React from 'react';
import {
    ConnectProvider,
    DisconnectProvider,
    SignAndSendTransactionProvider,
    SignMessageProvider,
    SignTransactionProvider,
} from './features/index.js';
import { WalletAccountProvider } from './WalletAccountProvider.js';
import { WalletProvider } from './WalletProvider.js';
import { WalletsProvider } from './WalletsProvider.js';

/** TODO: docs */
export interface WalletStandardProviderProps {
    children: NonNullable<ReactNode>;
    onError?: (error: Error) => void;
}

/** TODO: docs */
export const WalletStandardProvider: FC<WalletStandardProviderProps> = ({ children, onError }) => {
    return (
        <WalletsProvider>
            <WalletProvider>
                <WalletAccountProvider>
                    <ConnectProvider onError={onError}>
                        <DisconnectProvider onError={onError}>
                            <SignAndSendTransactionProvider onError={onError}>
                                <SignTransactionProvider onError={onError}>
                                    <SignMessageProvider onError={onError}>{children}</SignMessageProvider>
                                </SignTransactionProvider>
                            </SignAndSendTransactionProvider>
                        </DisconnectProvider>
                    </ConnectProvider>
                </WalletAccountProvider>
            </WalletProvider>
        </WalletsProvider>
    );
};
