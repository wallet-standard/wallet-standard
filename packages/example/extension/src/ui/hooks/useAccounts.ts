import { useContext } from 'react';

import { AccountsContext } from '../context/AccountsContext';

export function useAccounts() {
    const context = useContext(AccountsContext);
    if (typeof context === 'undefined') {
        throw new Error('useAccounts must be used within a AccountsProvider');
    }

    return context;
}
