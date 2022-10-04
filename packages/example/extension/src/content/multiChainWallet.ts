import { ETHEREUM_MAINNET_CHAIN } from '@wallet-standard/ethereum-chains';
import type { ConnectFeature, ConnectMethod } from '@wallet-standard/features';
import { SOLANA_MAINNET_CHAIN } from '@wallet-standard/solana-chains';
import type { Wallet, WalletAccount, WalletEventName, WalletEvent } from '@wallet-standard/standard';
import bs58 from 'bs58';
import { utils as ethUtils } from 'ethers';

import type { RPC } from '../messages';

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
        return ['standard:signTransaction'] as const;
    }

    constructor(publicKey: Uint8Array) {
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
        return ['standard:signTransaction'] as const;
    }

    constructor(publicKey: Uint8Array) {
        this.#publicKey = publicKey;
    }
}

export type MultiChainWalletAccount = EthereumWalletAccount | SolanaWalletAccount;

export class MultiChainWallet implements Wallet {
    #name = 'MultiChain Wallet';
    // TODO: Add image.
    #icon = 'data:image/svg+xml;base64,' as const;

    #accounts: MultiChainWalletAccount[] = [];

    readonly #listeners: { [E in WalletEventName]?: WalletEvent[E][] } = {};

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

    get features(): ConnectFeature {
        return {
            'standard:connect': {
                version: '1.0.0',
                connect: this.#connect,
            },
        };
    }

    get events() {
        return ['standard:change'] as const;
    }

    get accounts() {
        return this.#accounts;
    }

    constructor(rpc: RPC) {
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

        this.#emit('standard:change', ['accounts']);

        return {
            accounts: this.accounts,
        };
    };

    on<E extends WalletEventName>(event: E, listener: WalletEvent[E]): () => void {
        this.#listeners[event]?.push(listener) || (this.#listeners[event] = [listener]);
        return (): void => this.#off(event, listener);
    }

    #emit<E extends WalletEventName>(event: E, ...args: Parameters<WalletEvent[E]>): void {
        // eslint-disable-next-line prefer-spread
        this.#listeners[event]?.forEach((listener) => listener.apply(null, args));
    }

    #off<E extends WalletEventName>(event: E, listener: WalletEvent[E]): void {
        this.#listeners[event] = this.#listeners[event]?.filter((existingListener) => listener !== existingListener);
    }
}
