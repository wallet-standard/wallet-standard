import { Keypair as SolKeypair } from '@solana/web3.js';
import type { ReadonlyUint8Array } from '@wallet-standard/core';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { utils as ethUtils, Wallet as EthWallet } from 'ethers';

// SLIP-44.
// See: https://github.com/satoshilabs/slips/blob/master/slip-0044.md#registered-coin-types.
const BIP44_COIN_TYPE_ETH = 60;
const BIP44_COIN_TYPE_SOL = 501;

export type Mnemonic = string;

export interface Keypair {
    publicKey: ReadonlyUint8Array;
    privateKey: ReadonlyUint8Array;
}

export type Network = 'ethereum' | 'solana';

export interface Account {
    network: Network;
    publicKey: ReadonlyUint8Array;
}

/**
 * Generates a BIP-39 mnemonic.
 */
export function generateMnemonic(): Mnemonic {
    return bip39.generateMnemonic();
}

function deriveEthereumKeypair(mnemonic: Mnemonic, index = 0): Keypair {
    const path = `m/44'/${BIP44_COIN_TYPE_ETH}'/0'/${index}'`;
    const { publicKey, privateKey } = EthWallet.fromMnemonic(mnemonic, path);
    return {
        publicKey: ethUtils.arrayify(publicKey),
        privateKey: ethUtils.arrayify(privateKey),
    };
}

function deriveSolanaKeypair(mnemonic: Mnemonic, index = 0): Keypair {
    const seed = bip39.mnemonicToSeedSync(mnemonic, '');
    const path = `m/44'/${BIP44_COIN_TYPE_SOL}'/0'/${index}'`;
    const { publicKey, secretKey } = SolKeypair.fromSeed(derivePath(path, seed.toString('hex')).key);
    return {
        publicKey: new Uint8Array(publicKey.toBytes()),
        privateKey: secretKey,
    };
}

/**
 * Returns the list of accounts in the wallet.
 */
export function getAccounts(mnemonic: Mnemonic): Account[] {
    const ethereumKeypair = deriveEthereumKeypair(mnemonic);
    const solanaKeypair = deriveSolanaKeypair(mnemonic);
    return [
        { network: 'ethereum', publicKey: ethereumKeypair.publicKey },
        { network: 'solana', publicKey: solanaKeypair.publicKey },
    ];
}
