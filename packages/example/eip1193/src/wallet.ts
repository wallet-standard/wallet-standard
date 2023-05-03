import type { Wallet } from '@wallet-standard/base';
import type { EIP1193Provider } from 'eip1193-provider';
import { icon } from './icon.js';

export const EIP1193Namespace = 'eip1193:';

export type EIP1193Feature = {
    [EIP1193Namespace]: {
        provider: EIP1193Provider;
    };
};

export class EIP1193Wallet implements Wallet {
    readonly #version = '1.0.0' as const;
    readonly #name = 'EIP1193 Wallet' as const;
    readonly #icon = icon;
    readonly #provider: EIP1193Provider;

    get version() {
        return this.#version;
    }

    get name() {
        return this.#name;
    }

    get icon() {
        return this.#icon;
    }

    get chains() {
        return [];
    }

    get features(): EIP1193Feature {
        return {
            [EIP1193Namespace]: {
                provider: this.#provider,
            },
        };
    }

    get accounts() {
        return [];
    }

    constructor(provider: EIP1193Provider) {
        if (new.target === EIP1193Wallet) {
            Object.freeze(this);
        }

        this.#provider = provider;
    }
}
