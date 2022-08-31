import type { FC, ReactNode } from 'react';
import React from 'react';

import { AccountsProvider } from './AccountsContext';

export const AppContext: FC<{ children: NonNullable<ReactNode> }> = ({ children }) => {
    return <AccountsProvider>{children}</AccountsProvider>;
};
