/** Solana Mainnet (beta) cluster, e.g. https://api.mainnet-beta.solana.com */
export const SOLANA_MAINNET_CHAIN = 'solana:mainnet';

/** Solana Devnet cluster, e.g. https://api.devnet.solana.com */
export const SOLANA_DEVNET_CHAIN = 'solana:devnet';

/** Solana Testnet cluster, e.g. https://api.testnet.solana.com */
export const SOLANA_TESTNET_CHAIN = 'solana:testnet';

/** Solana Localnet cluster, e.g. http://localhost:8899 */
export const SOLANA_LOCALNET_CHAIN = 'solana:localnet';

/** Array of all Solana clusters */
export const SOLANA_CHAINS = [
    SOLANA_MAINNET_CHAIN,
    SOLANA_DEVNET_CHAIN,
    SOLANA_TESTNET_CHAIN,
    SOLANA_LOCALNET_CHAIN,
] as const;

/** Type of all Solana clusters */
export type SolanaChain = typeof SOLANA_CHAINS[number];
