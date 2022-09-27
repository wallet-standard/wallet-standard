/** Ethereum (mainnet) */
export const CHAIN_ETHEREUM = 'ethereum:1';

/** TODO: docs */
export const ETHEREUM_CHAINS = [CHAIN_ETHEREUM] as const;

/** TODO: docs */
export type EthereumChain = typeof CHAIN_ETHEREUM;

/**
 * Default encryption algorithm in NaCl.
 * Curve25519 scalar multiplication, Salsa20 secret-key encryption, and Poly1305 one-time authentication.
 */
export const CIPHER_x25519_xsalsa20_poly1305 = 'x25519-xsalsa20-poly1305';
