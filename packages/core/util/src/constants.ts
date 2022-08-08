/** Solana Mainnet (beta), e.g. https://api.mainnet-beta.solana.com */
export const CHAIN_SOLANA_MAINNET = 'solana:mainnet';

/** Solana Devnet, e.g. https://api.devnet.solana.com */
export const CHAIN_SOLANA_DEVNET = 'solana:devnet';

/** Solana Testnet, e.g. https://api.testnet.solana.com */
export const CHAIN_SOLANA_TESTNET = 'solana:testnet';

/** Solana Localnet, e.g. http://localhost:8899 */
export const CHAIN_SOLANA_LOCALNET = 'solana:localnet';

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
