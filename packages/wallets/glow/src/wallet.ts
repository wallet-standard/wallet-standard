// FIXME: refactor out web3.js dependency from glow
import type { TransactionSignature } from '@solana/web3.js';
import { Transaction } from '@solana/web3.js';
import type {
    ConnectFeature,
    ConnectMethod,
    EventsFeature,
    EventsListeners,
    EventsNames,
    EventsOnMethod,
    IdentifierString,
    SignMessageFeature,
    SignMessageMethod,
    SignMessageOutput,
    Wallet,
} from '@wallet-standard/core';
import { bytesEqual, ReadonlyWalletAccount } from '@wallet-standard/core';
import type {
    SOLANA_TESTNET_CHAIN,
    SolanaChain,
    SolanaSignAndSendTransactionFeature,
    SolanaSignAndSendTransactionMethod,
    SolanaSignAndSendTransactionOutput,
    SolanaSignTransactionFeature,
    SolanaSignTransactionMethod,
    SolanaSignTransactionOutput,
} from '@wallet-standard/solana';
import {
    getEndpointForChain,
    sendAndConfirmTransaction,
    SOLANA_DEVNET_CHAIN,
    SOLANA_LOCALNET_CHAIN,
    SOLANA_MAINNET_CHAIN,
} from '@wallet-standard/solana';
import { decode } from 'bs58';
import { Buffer } from 'buffer';
import { icon } from './icon.js';
import type { GlowAdapter, SolanaWindow } from './window.js';
import { Network } from './window.js';

declare const window: SolanaWindow;

export type GlowFeature = {
    'glow:': {
        glow: GlowAdapter;
    };
};

// Chains supported by the wallet
const chains = [SOLANA_MAINNET_CHAIN, SOLANA_DEVNET_CHAIN, SOLANA_LOCALNET_CHAIN] as const;
// Features supported by the wallet accounts
const features = ['solana:signAndSendTransaction', 'solana:signTransaction', 'standard:signMessage'] as const;

export class GlowWallet implements Wallet {
    readonly #listeners: { [E in EventsNames]?: EventsListeners[E][] } = {};
    readonly #version = '1.0.0' as const;
    readonly #name = 'Glow' as const;
    readonly #icon = icon;
    #account: ReadonlyWalletAccount | null;

    get version() {
        return this.#version;
    }

    get name() {
        return this.#name;
    }

    get icon() {
        return this.#icon;
    }

    get chains(): ReadonlyArray<SupportedChain> {
        return chains.slice();
    }

    get features(): ConnectFeature &
        EventsFeature &
        SolanaSignAndSendTransactionFeature &
        SolanaSignTransactionFeature &
        SignMessageFeature &
        GlowFeature {
        return {
            'standard:connect': {
                version: '1.0.0',
                connect: this.#connect,
            },
            'standard:events': {
                version: '1.0.0',
                on: this.#on,
            },
            'solana:signAndSendTransaction': {
                version: '1.0.0',
                supportedTransactionVersions: ['legacy'],
                signAndSendTransaction: this.#signAndSendTransaction,
            },
            'solana:signTransaction': {
                version: '1.0.0',
                supportedTransactionVersions: ['legacy'],
                signTransaction: this.#signTransaction,
            },
            'standard:signMessage': {
                version: '1.0.0',
                signMessage: this.#signMessage,
            },
            'glow:': {
                get glow() {
                    return window.glow;
                },
            },
        };
    }

    get accounts() {
        return this.#account ? [this.#account] : [];
    }

    constructor() {
        if (new.target === GlowWallet) {
            Object.freeze(this);
        }

        this.#account = null;

        window.glow.on('connect', this.#connected, this);
        window.glow.on('disconnect', this.#disconnected, this);
        window.glow.on('accountChanged', this.#reconnected, this);

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
        const address = window.glowSolana.publicKey?.toBase58();
        if (address) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const publicKey = window.glowSolana.publicKey!.toBytes();

            const account = this.#account;
            if (!account || account.address !== address || !bytesEqual(account.publicKey, publicKey)) {
                this.#account = new ReadonlyWalletAccount({ address, publicKey, chains, features });
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
        if (window.glowSolana.publicKey) {
            this.#connected();
        } else {
            this.#disconnected();
        }
    };

    #connect: ConnectMethod = async ({ silent } = {}) => {
        await window.glow.connect(silent ? { onlyIfTrusted: true } : undefined);

        this.#connected();

        return { accounts: this.accounts };
    };

    #signAndSendTransaction: SolanaSignAndSendTransactionMethod = async (...inputs) => {
        if (!this.#account) throw new Error('not connected');

        const outputs: SolanaSignAndSendTransactionOutput[] = [];

        if (inputs.length === 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const { transaction, account, chain, options } = inputs[0]!;
            const { commitment } = options || {};
            if (account !== this.#account) throw new Error('invalid account');
            if (!isSupportedChain(chain)) throw new Error('invalid chain');

            const glowSignAndSendTransaction = async () => {
                const { signature } = await window.glow.signAndSendTransaction({
                    transactionBase64: Buffer.from(transaction).toString('base64'),
                    network: getNetworkForChain(chain),
                    waitForConfirmation: options === 'confirmed',
                });

                return signature;
            };

            // FIXME: refactor out web3.js dependency from glow
            let signature: TransactionSignature;
            if (commitment === 'confirmed') {
                signature = await glowSignAndSendTransaction();
            } else {
                signature = await sendAndConfirmTransaction(
                    Transaction.from(transaction),
                    getEndpointForChain(chain),
                    options,
                    glowSignAndSendTransaction
                );
            }

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
            if (chain && !isSupportedChain(chain)) throw new Error('invalid chain');

            // FIXME: refactor out web3.js dependency from glow
            const signedTransaction = await window.glowSolana.signTransaction(
                Transaction.from(transaction),
                chain && getNetworkForChain(chain)
            );

            outputs.push({
                signedTransaction: signedTransaction.serialize({
                    requireAllSignatures: false,
                    verifySignatures: false,
                }),
            });
        } else if (inputs.length > 1) {
            let chain: SupportedChain | undefined = undefined;
            for (const input of inputs) {
                if (input.account !== this.#account) throw new Error('invalid account');
                if (input.chain) {
                    if (!isSupportedChain(input.chain)) throw new Error('invalid chain');
                    if (chain) {
                        if (input.chain !== chain) throw new Error('conflicting chain');
                    } else {
                        chain = input.chain;
                    }
                }
            }

            // FIXME: refactor out web3.js dependency from glow
            const transactions = inputs.map(({ transaction }) => Transaction.from(transaction));

            const signedTransactions = await window.glowSolana.signAllTransactions(
                transactions,
                chain && getNetworkForChain(chain)
            );

            outputs.push(
                ...signedTransactions.map((signedTransaction) => ({
                    signedTransaction: signedTransaction.serialize({
                        requireAllSignatures: false,
                        verifySignatures: false,
                    }),
                }))
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

            const { signedMessageBase64 } = await window.glow.signMessage({
                messageBase64: Buffer.from(message).toString('base64'),
            });

            const signature = new Uint8Array(Buffer.from(signedMessageBase64, 'base64'));

            outputs.push({ signedMessage: message, signature });
        } else if (inputs.length > 1) {
            for (const input of inputs) {
                outputs.push(...(await this.#signMessage(input)));
            }
        }

        return outputs;
    };
}

type SupportedChain = Exclude<SolanaChain, typeof SOLANA_TESTNET_CHAIN>;

function isSupportedChain(chain: IdentifierString): chain is SupportedChain {
    return chains.includes(chain as SupportedChain);
}

function getNetworkForChain(chain: SupportedChain): Network {
    switch (chain) {
        case SOLANA_MAINNET_CHAIN:
            return Network.Mainnet;
        case SOLANA_DEVNET_CHAIN:
            return Network.Devnet;
        case SOLANA_LOCALNET_CHAIN:
            return Network.Localnet;
        default:
            return Network.Mainnet;
    }
}
