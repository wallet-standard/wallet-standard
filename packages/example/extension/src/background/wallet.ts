import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import * as ethers from 'ethers';

export type Mnemonic = string;

export interface Account {
    address: Uint8Array;
    publicKey: Uint8Array;
    privateKey: Uint8Array;
}

export function generateMnemonic(): Mnemonic {
    return bip39.generateMnemonic();
}

export function deriveEthereumAccount(mnemonic: Mnemonic): Account {
    const { address, publicKey, privateKey } = ethers.Wallet.fromMnemonic(mnemonic);
    return {
        address: ethers.utils.arrayify(address),
        publicKey: ethers.utils.arrayify(publicKey),
        privateKey: ethers.utils.arrayify(privateKey),
    };
}

export function deriveSolanaAccount(mnemonic: Mnemonic): Account {
    const seed = bip39.mnemonicToSeedSync(mnemonic, '');
    const path = "m/44'/501'/0'/0'";
    const keypair = Keypair.fromSeed(derivePath(path, seed.toString('hex')).key);
    return {
        address: keypair.publicKey.toBytes(),
        publicKey: keypair.publicKey.toBytes(),
        privateKey: keypair.secretKey,
    };
}
