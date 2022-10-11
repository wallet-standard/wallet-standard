// This file is copied with modification from @wallet-standard/solana-util

import type { SolanaChain } from './solana.js';
import { SOLANA_DEVNET_CHAIN, SOLANA_LOCALNET_CHAIN, SOLANA_MAINNET_CHAIN, SOLANA_TESTNET_CHAIN } from './solana.js';

export const MAINNET_ENDPOINT = 'https://api.mainnet-beta.solana.com';
export const DEVNET_ENDPOINT = 'https://api.devnet.solana.com';
export const TESTNET_ENDPOINT = 'https://api.testnet.solana.com';
export const LOCALNET_ENDPOINT = 'http://localhost:8899';

export function getEndpointForChain(chain: SolanaChain, endpoint?: string): string {
    if (endpoint) return endpoint;
    if (chain === SOLANA_MAINNET_CHAIN) return MAINNET_ENDPOINT;
    if (chain === SOLANA_DEVNET_CHAIN) return DEVNET_ENDPOINT;
    if (chain === SOLANA_TESTNET_CHAIN) return TESTNET_ENDPOINT;
    if (chain === SOLANA_LOCALNET_CHAIN) return LOCALNET_ENDPOINT;
    return MAINNET_ENDPOINT;
}
