import type { FC, ReactNode } from 'react';
import React from 'react';
import { WalletAccountProvider } from './WalletAccountProvider.js';
import { WalletProvider } from './WalletProvider.js';

/** TODO: docs */
export interface WalletStandardProviderProps {
    children: NonNullable<ReactNode>;
    onError?: (error: Error) => void;
}

/** TODO: docs */
export const WalletStandardProvider: FC<WalletStandardProviderProps> = ({ children }) => {
    return (
        <WalletProvider>
            <WalletAccountProvider>{children}</WalletAccountProvider>
        </WalletProvider>
    );
};
