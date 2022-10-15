import type { WalletAccount } from '@wallet-standard/base';

export class ReadonlyWalletAccount implements WalletAccount {
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

    constructor(account: WalletAccount) {
        if (new.target === ReadonlyWalletAccount) {
            Object.freeze(this);
        }

        this.#address = account.address;
        this.#publicKey = account.publicKey;
        this.#chains = account.chains;
        this.#features = account.features;
        this.#label = account.label;
        this.#icon = account.icon;
    }
}
