/** Initial version. */
export const VERSION_1_0_0 = '1.0.0';

/** Alias for 1.0.0 */
export const DEFAULT_VERSION = VERSION_1_0_0;

/** Solana Mainnet (beta), e.g. https://api.mainnet-beta.solana.com */
export const CHAIN_SOLANA_MAINNET = 'solana:mainnet';

/** Solana Devnet, e.g. https://api.devnet.solana.com */
export const CHAIN_SOLANA_DEVNET = 'solana:devnet';

/** Solana Testnet, e.g. https://api.testnet.solana.com */
export const CHAIN_SOLANA_TESTNET = 'solana:testnet';

/** Ethereum (mainnet) */
export const CHAIN_ETHEREUM = 'ethereum:1';

/**
 * Default in NaCl.
 * Curve25519 scalar multiplication, Salsa20 secret-key encryption, and Poly1305 one-time authentication.
 */
export const CIPHER_x25519_xsalsa20_poly1305 = 'x25519-xsalsa20-poly1305';

/** Alias for x25519-xsalsa20-poly1305 */
export const CIPHER_DEFAULT = CIPHER_x25519_xsalsa20_poly1305;

// TODO: add cipher for padded x25519-xsalsa20-poly1305
