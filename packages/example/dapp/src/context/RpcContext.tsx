import type { Rpc, RpcSubscriptions, SolanaRpcApi, SolanaRpcSubscriptionsApi } from '@solana/web3.js-experimental';
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/web3.js-experimental';
import { createContext } from 'react';

export const RpcContext = createContext<{
    rpc: Rpc<SolanaRpcApi>;
    rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
}>({
    rpc: createSolanaRpc('https://api.devnet.solana.com'),
    rpcSubscriptions: createSolanaRpcSubscriptions('wss://api.devnet.solana.com'),
});
