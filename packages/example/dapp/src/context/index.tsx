import { WalletStandardProvider } from '@wallet-standard/core';
import type { FC, ReactNode } from 'react';
import React from 'react';

export const AppContext: FC<{ children: NonNullable<ReactNode> }> = ({ children }) => {
    return <WalletStandardProvider>{children}</WalletStandardProvider>;
};
