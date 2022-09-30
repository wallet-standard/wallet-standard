import { useWallet } from '@wallet-standard/react';

export function useIsConnected() {
    const { accounts } = useWallet();
    return accounts.length > 0;
}
