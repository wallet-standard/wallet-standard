import { useWallet } from '@wallet-standard/core';

export function useIsConnected() {
    const { accounts } = useWallet();
    return accounts.length > 0;
}
