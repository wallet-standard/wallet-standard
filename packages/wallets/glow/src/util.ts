// This file is copied with modification from @wallet-standard/util

import type { WalletAccount } from '@wallet-standard/standard';
import { SOLANA_CHAINS } from './solana.js';

const chains = SOLANA_CHAINS;
const features = ['solana:signAndSendTransaction', 'solana:signTransaction', 'standard:signMessage'] as const;

export class GlowWalletAccount implements WalletAccount {
    readonly #address: WalletAccount['address'];
    readonly #publicKey: WalletAccount['publicKey'];
    readonly #chains: WalletAccount['chains'];
    readonly #features: WalletAccount['features'];
    readonly #label: WalletAccount['label'];
    readonly #icon: WalletAccount['icon'];

    get address() {
        return this.#address;
    }

    get publicKey() {
        return this.#publicKey.slice();
    }

    get chains() {
        return this.#chains.slice();
    }

    get features() {
        return this.#features.slice();
    }

    get label() {
        return this.#label;
    }

    get icon() {
        return this.#icon;
    }

    constructor({ address, publicKey, label, icon }: Omit<WalletAccount, 'chains' | 'features'>) {
        if (new.target === GlowWalletAccount) {
            Object.freeze(this);
        }

        this.#address = address;
        this.#publicKey = publicKey;
        this.#chains = chains;
        this.#features = features;
        this.#label = label;
        this.#icon = icon;
    }
}

export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
    return arraysEqual(a, b);
}

interface Indexed<T> {
    length: number;
    [index: number]: T;
}

export function arraysEqual<T>(a: Indexed<T>, b: Indexed<T>): boolean {
    if (a === b) return true;

    const length = a.length;
    if (length !== b.length) return false;

    for (let i = 0; i < length; i++) {
        if (a[i] !== b[i]) return false;
    }

    return true;
}
