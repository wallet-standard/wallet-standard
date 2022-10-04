import { PublicKey, Transaction } from '@solana/web3.js';
import type {
    ConnectFeature,
    ConnectMethod,
    SignMessageFeature,
    SignMessageMethod,
    SignMessageOutput,
} from '@wallet-standard/features';
import type { SolanaChain } from '@wallet-standard/solana-chains';
import type {
    SolanaSignAndSendTransactionFeature,
    SolanaSignAndSendTransactionMethod,
    SolanaSignAndSendTransactionOutput,
    SolanaSignTransactionFeature,
    SolanaSignTransactionMethod,
    SolanaSignTransactionOutput,
} from '@wallet-standard/solana-features';
import { getChainForEndpoint } from '@wallet-standard/solana-web3.js';
import type { Wallet, WalletAccount, WalletEventName, WalletEvent } from '@wallet-standard/standard';
import { bytesEqual, ReadonlyWalletAccount } from '@wallet-standard/util';
import { decode } from 'bs58';
import { icon } from './icon.js';
import type { Backpack, BackpackWindow } from './window.js';

declare const window: BackpackWindow;

export type BackpackSolanaFeature = {
    'backpack:': {
        backpack: Backpack;
    };
};

export class BackpackSolanaWallet implements Wallet {
    readonly #listeners: { [E in WalletEventName]?: WalletEvent[E][] } = {};
    readonly #version = '1.0.0' as const;
    readonly #name = 'Backpack' as const;
    readonly #icon = icon;
    readonly #events = ['standard:change'] as const;
    #chain: SolanaChain;
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

    get chains() {
        return [this.#chain];
    }

    get features(): ConnectFeature &
        SolanaSignAndSendTransactionFeature &
        SolanaSignTransactionFeature &
        SignMessageFeature &
        BackpackSolanaFeature {
        return {
            'standard:connect': {
                version: '1.0.0',
                connect: this.#connect,
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
            'backpack:': {
                get backpack() {
                    return window.backpack;
                },
            },
        };
    }

    get events() {
        return this.#events.slice();
    }

    get accounts() {
        return this.#account ? [this.#account] : [];
    }

    constructor() {
        this.#chain = getChainForEndpoint(window.backpack.connection.rpcEndpoint);
        this.#account = null;

        window.backpack.on('connect', this.#connected);
        window.backpack.on('disconnect', this.#disconnected);
        window.backpack.on('connectionDidChange', this.#reconnected);

        this.#connected();
    }

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

    #connected = () => {
        const properties: ('chains' | 'accounts')[] = [];

        const chain = getChainForEndpoint(window.backpack.connection.rpcEndpoint);
        if (chain !== this.#chain) {
            this.#chain = chain;
            properties.push('chains');
        }

        const address = window.backpack.publicKey?.toBase58();
        if (address) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const publicKey = window.backpack.publicKey!.toBytes();

            const account = this.#account;
            if (
                !account ||
                account.address !== address ||
                !bytesEqual(account.publicKey, publicKey) ||
                !account.chains.includes(chain)
            ) {
                this.#account = new ReadonlyWalletAccount({
                    address,
                    publicKey,
                    chains: [chain],
                    features: ['solana:signAndSendTransaction', 'solana:signTransaction', 'standard:signMessage'],
                });
                properties.push('accounts');
            }
        }

        if (properties.length) {
            this.#emit('standard:change', properties);
        }
    };

    #disconnected = () => {
        if (this.#account) {
            this.#account = null;
            this.#emit('standard:change', ['accounts']);
        }
    };

    #reconnected = () => {
        if (window.backpack.publicKey) {
            this.#connected();
        } else {
            this.#disconnected();
        }
    };

    #connect: ConnectMethod = async (input) => {
        if (!input?.silent && !window.backpack.isConnected) {
            await window.backpack.connect();
        }

        this.#connected();

        return { accounts: this.accounts };
    };

    #signAndSendTransaction: SolanaSignAndSendTransactionMethod = async (...inputs) => {
        const outputs: SolanaSignAndSendTransactionOutput[] = [];

        if (inputs.length === 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const input = inputs[0]!;
            const transaction = Transaction.from(input.transaction);
            const publicKey = new PublicKey(input.account.publicKey);
            const { commitment, preflightCommitment, skipPreflight, maxRetries, minContextSlot } = input.options || {};

            // TODO: input.account.chain could require a different connection than window.backpack.connection

            const signature = commitment
                ? await window.backpack.sendAndConfirm(
                      transaction,
                      [],
                      {
                          commitment,
                          preflightCommitment,
                          skipPreflight,
                          maxRetries,
                          minContextSlot,
                      },
                      undefined,
                      publicKey
                  )
                : await window.backpack.send(
                      transaction,
                      [],
                      {
                          preflightCommitment,
                          skipPreflight,
                          maxRetries,
                          minContextSlot,
                      },
                      undefined,
                      publicKey
                  );

            outputs.push({ signature: decode(signature) });
        } else if (inputs.length > 1) {
            for (const input of inputs) {
                outputs.push(...(await this.#signAndSendTransaction(input)));
            }
        }

        return outputs;
    };

    #signTransaction: SolanaSignTransactionMethod = async (...inputs) => {
        const outputs: SolanaSignTransactionOutput[] = [];

        if (inputs.length === 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const input = inputs[0]!;
            const transaction = Transaction.from(input.transaction);
            const publicKey = new PublicKey(input.account.publicKey);
            const signedTransaction = await window.backpack.signTransaction(transaction, publicKey);

            outputs.push({
                signedTransaction: signedTransaction.serialize({
                    requireAllSignatures: false,
                    verifySignatures: false,
                }),
            });
        } else if (inputs.length > 1) {
            // Group the transactions by the account that will be signing, noting the order of the transactions.
            const groups = new Map<WalletAccount, [number, Transaction][]>();
            for (const [i, input] of inputs.entries()) {
                let group = groups.get(input.account);
                if (!group) {
                    group = [];
                    groups.set(input.account, group);
                }
                group.push([i, Transaction.from(input.transaction)]);
            }

            // For each account, call `signAllTransactions` with the transactions, preserving their order in the output.
            for (const [account, group] of groups.entries()) {
                // Unzip the indexes and transactions.
                const [indexes, transactions] = group.reduce(
                    ([indexes, transactions], [index, transaction]) => {
                        indexes.push(index);
                        transactions.push(transaction);
                        return [indexes, transactions];
                    },
                    [<number[]>[], <Transaction[]>[]]
                );

                const signedTransactions = await window.backpack.signAllTransactions(
                    transactions,
                    new PublicKey(account.publicKey)
                );

                const rawTransactions = signedTransactions.map((signedTransaction) =>
                    signedTransaction.serialize({
                        requireAllSignatures: false,
                        verifySignatures: false,
                    })
                );

                for (const [i, index] of indexes.entries()) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    outputs[index] = { signedTransaction: rawTransactions[i]! };
                }
            }
        }

        return outputs;
    };

    #signMessage: SignMessageMethod = async (...inputs) => {
        const outputs: SignMessageOutput[] = [];

        if (inputs.length === 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const input = inputs[0]!;
            const publicKey = new PublicKey(input.account.publicKey);
            const signedMessage = input.message;
            const signature = await window.backpack.signMessage(signedMessage, publicKey);

            outputs.push({ signedMessage, signature });
        } else if (inputs.length > 1) {
            for (const input of inputs) {
                outputs.push(...(await this.#signMessage(input)));
            }
        }

        return outputs;
    };
}
