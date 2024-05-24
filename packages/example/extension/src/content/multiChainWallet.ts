import { SOLANA_MAINNET_CHAIN } from '@solana/wallet-standard';
import type {
    ConnectFeature,
    ConnectMethod,
    EventsFeature,
    EventsListeners,
    EventsNames,
    EventsOnMethod,
    Wallet,
    WalletAccount,
} from '@wallet-standard/core';
import { ETHEREUM_MAINNET_CHAIN } from '@wallet-standard/ethereum';
import bs58 from 'bs58';
import { utils as ethUtils } from 'ethers';
import type { RPC } from '../messages/index';

export class EthereumWalletAccount implements WalletAccount {
    readonly #publicKey: Uint8Array;

    get address() {
        return ethUtils.computeAddress(this.publicKey);
    }

    get publicKey() {
        return this.#publicKey.slice();
    }

    get chains() {
        return [ETHEREUM_MAINNET_CHAIN] as const;
    }

    get features() {
        return ['experimental:signTransaction'] as const;
    }

    constructor(publicKey: Uint8Array) {
        if (new.target === EthereumWalletAccount) {
            Object.freeze(this);
        }

        this.#publicKey = publicKey;
    }
}

export class SolanaWalletAccount implements WalletAccount {
    readonly #publicKey: Uint8Array;

    get address() {
        return bs58.encode(this.publicKey);
    }

    get publicKey() {
        return this.#publicKey.slice();
    }

    get chains() {
        return [SOLANA_MAINNET_CHAIN] as const;
    }

    get features() {
        return ['experimental:signTransaction'] as const;
    }

    constructor(publicKey: Uint8Array) {
        if (new.target === SolanaWalletAccount) {
            Object.freeze(this);
        }

        this.#publicKey = publicKey;
    }
}

export type MultiChainWalletAccount = EthereumWalletAccount | SolanaWalletAccount;

export class MultiChainWallet implements Wallet {
    #name = 'MultiChain Wallet';
    // TODO: Add image.
    #icon = 'data:image/svg+xml;base64,' as const;

    #accounts: MultiChainWalletAccount[] = [];

    readonly #listeners: { [E in EventsNames]?: EventsListeners[E][] } = {};

    #rpc: RPC;

    get version() {
        return '1.0.0' as const;
    }

    get name() {
        return this.#name;
    }

    get icon() {
        return this.#icon;
    }

    get chains() {
        return [ETHEREUM_MAINNET_CHAIN, SOLANA_MAINNET_CHAIN] as const;
    }

    get features(): ConnectFeature & EventsFeature {
        return {
            'standard:connect': {
                version: '1.0.0',
                connect: this.#connect,
            },
            'standard:events': {
                version: '1.0.0',
                on: this.#on,
            },
        };
    }

    get accounts() {
        return this.#accounts;
    }

    constructor(rpc: RPC) {
        if (new.target === MultiChainWallet) {
            Object.freeze(this);
        }

        this.#rpc = rpc;
    }

    #connect: ConnectMethod = async ({ silent } = {}) => {
        const accounts = await this.#rpc.callMethod('connect');

        if (accounts === null) {
            throw new Error('The user rejected the request.');
        }

        this.#accounts = accounts.map((account: { network: string; publicKey: Uint8Array }) => {
            const { network, publicKey } = account;
            switch (network) {
                case 'ethereum':
                    return new EthereumWalletAccount(publicKey);
                case 'solana':
                    return new SolanaWalletAccount(publicKey);
                default:
                    throw new Error(`Unknown network: '${network}'`);
            }
        });

        this.#emit('change', { accounts: this.accounts });

        return {
            accounts: this.accounts,
        };
    };

    #on: EventsOnMethod = (event, listener) => {
        this.#listeners[event]?.push(listener) || (this.#listeners[event] = [listener]);
        return (): void => this.#off(event, listener);
    };

    #emit<E extends EventsNames>(event: E, ...args: Parameters<EventsListeners[E]>): void {
        // eslint-disable-next-line prefer-spread
        this.#listeners[event]?.forEach((listener) => listener.apply(null, args));
    }

    #off<E extends EventsNames>(event: E, listener: EventsListeners[E]): void {
        this.#listeners[event] = this.#listeners[event]?.filter((existingListener) => listener !== existingListener);
    }
}
