import type { IdentifierArray, WalletAccount } from '@wallet-standard/standard';

export class ReadonlyWalletAccount implements WalletAccount {
    readonly #address: string;
    readonly #publicKey: Uint8Array;
    readonly #chains: IdentifierArray;
    readonly #features: IdentifierArray;

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

    constructor(address: string, publicKey: Uint8Array, chains: IdentifierArray, features: IdentifierArray) {
        this.#address = address;
        this.#publicKey = publicKey;
        this.#chains = chains;
        this.#features = features;
    }
}
