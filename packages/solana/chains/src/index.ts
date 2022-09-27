/** Solana Mainnet (beta), e.g. https://api.mainnet-beta.solana.com */
export const SOLANA_MAINNET_CHAIN = 'solana:mainnet';

/** Solana Devnet, e.g. https://api.devnet.solana.com */
export const SOLANA_DEVNET_CHAIN = 'solana:devnet';

/** Solana Testnet, e.g. https://api.testnet.solana.com */
export const SOLANA_TESTNET_CHAIN = 'solana:testnet';

/** Solana Localnet, e.g. http://localhost:8899 */
export const SOLANA_LOCALNET_CHAIN = 'solana:localnet';

/** TODO: docs */
export const SOLANA_CHAINS = [
    SOLANA_MAINNET_CHAIN,
    SOLANA_DEVNET_CHAIN,
    SOLANA_TESTNET_CHAIN,
    SOLANA_LOCALNET_CHAIN,
] as const;

/** TODO: docs */
export type SolanaChain =
    | typeof SOLANA_MAINNET_CHAIN
    | typeof SOLANA_DEVNET_CHAIN
    | typeof SOLANA_TESTNET_CHAIN
    | typeof SOLANA_LOCALNET_CHAIN;
