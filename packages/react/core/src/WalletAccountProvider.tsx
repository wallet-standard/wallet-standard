import type { WalletAccount } from '@wallet-standard/base';
import type { FC, ReactNode } from 'react';
import React, { useState } from 'react';
import { WalletAccountContext } from './useWalletAccount.js';

/** TODO: docs */
export interface WalletAccountProviderProps {
    children: NonNullable<ReactNode>;
}

/** TODO: docs */
export const WalletAccountProvider: FC<WalletAccountProviderProps> = ({ children }) => {
    const [walletAccount, setWalletAccount] = useState<WalletAccount | null>(null);

    return (
        <WalletAccountContext.Provider
            value={{
                walletAccount,
                setWalletAccount,
            }}
        >
            {children}
        </WalletAccountContext.Provider>
    );
};
