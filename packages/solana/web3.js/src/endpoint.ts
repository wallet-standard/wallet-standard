import { clusterApiUrl } from '@solana/web3.js';
import type { SolanaChain } from '@wallet-standard/solana-chains';
import {
    SOLANA_DEVNET_CHAIN,
    SOLANA_LOCALNET_CHAIN,
    SOLANA_MAINNET_CHAIN,
    SOLANA_TESTNET_CHAIN,
} from '@wallet-standard/solana-chains';

export function getChainForEndpoint(endpoint: string): SolanaChain {
    if (endpoint === clusterApiUrl('devnet')) {
        return SOLANA_DEVNET_CHAIN;
    } else if (endpoint === clusterApiUrl('testnet')) {
        return SOLANA_TESTNET_CHAIN;
    } else if (/^https?:\/\/localhost[:/]/.test(endpoint)) {
        return SOLANA_LOCALNET_CHAIN;
    } else {
        return SOLANA_MAINNET_CHAIN;
    }
}

export function getEndpointForChain(chain: SolanaChain, endpoint?: string): string {
    if (!endpoint) {
        if (chain === SOLANA_MAINNET_CHAIN) {
            endpoint = clusterApiUrl('mainnet-beta');
        } else if (chain === SOLANA_DEVNET_CHAIN) {
            endpoint = clusterApiUrl('devnet');
        } else if (chain === SOLANA_TESTNET_CHAIN) {
            endpoint = clusterApiUrl('testnet');
        } else if (chain === SOLANA_LOCALNET_CHAIN) {
            endpoint = 'http://localhost:8899';
        } else {
            endpoint = clusterApiUrl('mainnet-beta');
        }
    }
    return endpoint;
}
