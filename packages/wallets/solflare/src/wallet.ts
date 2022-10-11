import { Connection, VersionedTransaction } from '@solana/web3.js';
import type {
    ConnectFeature,
    ConnectMethod,
    DisconnectFeature,
    DisconnectMethod,
    EventsFeature,
    EventsListeners,
    EventsNames,
    EventsOnMethod,
    SignMessageFeature,
    SignMessageMethod,
    SignMessageOutput,
} from '@wallet-standard/features';
import type {
    SolanaSignAndSendTransactionFeature,
    SolanaSignAndSendTransactionMethod,
    SolanaSignAndSendTransactionOutput,
    SolanaSignTransactionFeature,
    SolanaSignTransactionMethod,
    SolanaSignTransactionOutput,
} from '@wallet-standard/solana-features';
import type { Wallet } from '@wallet-standard/standard';
import { decode } from 'bs58';
import { default as Solflare } from '@solflare-wallet/sdk';
import { SolflareWalletAccount } from './account.js';
import { getEndpointForChain } from './endpoint.js';
import { icon } from './icon.js';
import type { SolanaChain } from './solana.js';
import { isSolanaChain, SOLANA_CHAINS } from './solana.js';
import { bytesEqual } from './util.js';

export type SolflareFeature = {
    'solflare:': {
        solflare: Solflare;
    };
};

const solflare = new Solflare();

export class SolflareWallet implements Wallet {
    readonly #listeners: { [E in EventsNames]?: EventsListeners[E][] } = {};
    readonly #version = '1.0.0' as const;
    readonly #name = 'Solflare' as const;
    readonly #icon = icon;
    #account: SolflareWalletAccount | null = null;

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
        return SOLANA_CHAINS.slice();
    }

    get features(): ConnectFeature &
        DisconnectFeature &
        EventsFeature &
        SolanaSignAndSendTransactionFeature &
        SolanaSignTransactionFeature &
        SignMessageFeature &
        SolflareFeature {
        return {
            'standard:connect': {
                version: '1.0.0',
                connect: this.#connect,
            },
            'standard:disconnect': {
                version: '1.0.0',
                disconnect: this.#disconnect,
            },
            'standard:events': {
                version: '1.0.0',
                on: this.#on,
            },
            'solana:signAndSendTransaction': {
                version: '1.0.0',
                supportedTransactionVersions: ['legacy', 0],
                signAndSendTransaction: this.#signAndSendTransaction,
            },
            'solana:signTransaction': {
                version: '1.0.0',
                supportedTransactionVersions: ['legacy', 0],
                signTransaction: this.#signTransaction,
            },
            'standard:signMessage': {
                version: '1.0.0',
                signMessage: this.#signMessage,
            },
            'solflare:': {
                get solflare() {
                    return solflare;
                },
            },
        };
    }

    get accounts() {
        return this.#account ? [this.#account] : [];
    }

    constructor() {
        if (new.target === SolflareWallet) {
            Object.freeze(this);
        }

        solflare.on('connect', this.#connected, this);
        solflare.on('disconnect', this.#disconnected, this);
        solflare.on('accountChanged', this.#reconnected, this);

        this.#connected();
    }

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

    #connected = () => {
        const address = solflare.publicKey?.toBase58();
        if (address) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const publicKey = solflare.publicKey!.toBytes();

            const account = this.#account;
            if (!account || account.address !== address || !bytesEqual(account.publicKey, publicKey)) {
                this.#account = new SolflareWalletAccount({ address, publicKey });
                this.#emit('change', { accounts: this.accounts });
            }
        }
    };

    #disconnected = () => {
        if (this.#account) {
            this.#account = null;
            this.#emit('change', { accounts: this.accounts });
        }
    };

    #reconnected = () => {
        if (solflare.publicKey) {
            this.#connected();
        } else {
            this.#disconnected();
        }
    };

    #connect: ConnectMethod = async ({ silent } = {}) => {
        if (!silent && !solflare.publicKey) {
            await solflare.connect();
        }

        this.#connected();

        return { accounts: this.accounts };
    };

    #disconnect: DisconnectMethod = async () => {
        await solflare.disconnect();
    };

    #signAndSendTransaction: SolanaSignAndSendTransactionMethod = async (...inputs) => {
        if (!this.#account) throw new Error('not connected');

        const outputs: SolanaSignAndSendTransactionOutput[] = [];

        if (inputs.length === 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const { transaction, account, chain, options } = inputs[0]!;
            const { commitment, preflightCommitment, skipPreflight, maxRetries, minContextSlot } = options || {};
            if (account !== this.#account) throw new Error('invalid account');
            if (!isSolanaChain(chain)) throw new Error('invalid chain');

            const signedTransaction = await solflare.signTransaction(VersionedTransaction.deserialize(transaction));

            const connection = new Connection(getEndpointForChain(chain), commitment || preflightCommitment);
            const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
                preflightCommitment,
                skipPreflight,
                maxRetries,
                minContextSlot,
            });

            outputs.push({ signature: decode(signature) });
        } else if (inputs.length > 1) {
            for (const input of inputs) {
                outputs.push(...(await this.#signAndSendTransaction(input)));
            }
        }

        return outputs;
    };

    #signTransaction: SolanaSignTransactionMethod = async (...inputs) => {
        if (!this.#account) throw new Error('not connected');

        const outputs: SolanaSignTransactionOutput[] = [];

        if (inputs.length === 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const { transaction, account, chain } = inputs[0]!;
            if (account !== this.#account) throw new Error('invalid account');
            if (chain && !isSolanaChain(chain)) throw new Error('invalid chain');

            const signedTransaction = await solflare.signTransaction(VersionedTransaction.deserialize(transaction));

            outputs.push({ signedTransaction: signedTransaction.serialize() });
        } else if (inputs.length > 1) {
            let chain: SolanaChain | undefined = undefined;
            for (const input of inputs) {
                if (input.account !== this.#account) throw new Error('invalid account');
                if (input.chain) {
                    if (!isSolanaChain(input.chain)) throw new Error('invalid chain');
                    if (chain) {
                        if (input.chain !== chain) throw new Error('conflicting chain');
                    } else {
                        chain = input.chain;
                    }
                }
            }

            const transactions = inputs.map(({ transaction }) => VersionedTransaction.deserialize(transaction));

            const signedTransactions = await solflare.signAllTransactions(transactions);

            outputs.push(
                ...signedTransactions.map((signedTransaction) => ({ signedTransaction: signedTransaction.serialize() }))
            );
        }

        return outputs;
    };

    #signMessage: SignMessageMethod = async (...inputs) => {
        if (!this.#account) throw new Error('not connected');

        const outputs: SignMessageOutput[] = [];

        if (inputs.length === 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const { message, account } = inputs[0]!;
            if (account !== this.#account) throw new Error('invalid account');

            const signature = await solflare.signMessage(message);

            outputs.push({ signedMessage: message, signature });
        } else if (inputs.length > 1) {
            for (const input of inputs) {
                outputs.push(...(await this.#signMessage(input)));
            }
        }

        return outputs;
    };
}
