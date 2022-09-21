import { clusterApiUrl } from '@solana/web3.js';
import type { SolanaChain } from '@wallet-standard/util';
import {
    CHAIN_SOLANA_DEVNET,
    CHAIN_SOLANA_LOCALNET,
    CHAIN_SOLANA_MAINNET,
    CHAIN_SOLANA_TESTNET,
} from '@wallet-standard/util';

export function getChainForEndpoint(endpoint: string): SolanaChain {
    if (endpoint === clusterApiUrl('devnet')) {
        return CHAIN_SOLANA_DEVNET;
    } else if (endpoint === clusterApiUrl('testnet')) {
        return CHAIN_SOLANA_TESTNET;
    } else if (/^https?:\/\/localhost[:/]/.test(endpoint)) {
        return CHAIN_SOLANA_LOCALNET;
    } else {
        return CHAIN_SOLANA_MAINNET;
    }
}

export function getEndpointForChain(chain: SolanaChain, endpoint?: string): string {
    if (!endpoint) {
        if (chain === CHAIN_SOLANA_MAINNET) {
            endpoint = clusterApiUrl('mainnet-beta');
        } else if (chain === CHAIN_SOLANA_DEVNET) {
            endpoint = clusterApiUrl('devnet');
        } else if (chain === CHAIN_SOLANA_TESTNET) {
            endpoint = clusterApiUrl('testnet');
        } else if (chain === CHAIN_SOLANA_LOCALNET) {
            endpoint = 'http://localhost:8899';
        } else {
            endpoint = clusterApiUrl('mainnet-beta');
        }
    }
    return endpoint;
}
