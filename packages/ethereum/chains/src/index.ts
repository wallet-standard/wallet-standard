/** Ethereum Mainnet, e.g. https://eth-mainnet.public.blastapi.io */
export const ETHEREUM_MAINNET_CHAIN = 'ethereum:1';

/** Ethereum Görli, e.g. https://eth-goerli.public.blastapi.io */
export const ETHEREUM_GOERLI_CHAIN = 'ethereum:5';

/** TODO: docs */
export const ETHEREUM_CHAINS = [ETHEREUM_MAINNET_CHAIN, ETHEREUM_GOERLI_CHAIN] as const;

/** TODO: docs */
export type EthereumChain = (typeof ETHEREUM_CHAINS)[number];
