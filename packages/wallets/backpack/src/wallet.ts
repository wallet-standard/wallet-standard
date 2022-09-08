import { clusterApiUrl, PublicKey, Transaction } from '@solana/web3.js';
import type {
    SignMessageFeature,
    SignMessageMethod,
    SignMessageOutput,
    SignTransactionFeature,
    SignTransactionMethod,
    SignTransactionOutput,
    SolanaSignAndSendTransactionFeature,
    SolanaSignAndSendTransactionMethod,
    SolanaSignAndSendTransactionOutput,
} from '@wallet-standard/features';
import type { ConnectInput, ConnectOutput, Wallet, WalletEventNames, WalletEvents } from '@wallet-standard/standard';
import type { SolanaChain } from '@wallet-standard/util';
import {
    bytesEqual,
    CHAIN_SOLANA_DEVNET,
    CHAIN_SOLANA_LOCALNET,
    CHAIN_SOLANA_MAINNET,
    CHAIN_SOLANA_TESTNET,
} from '@wallet-standard/util';
import { decode } from 'bs58';
import { BackpackSolanaWalletAccount } from './account.js';
import type { BackpackWindow } from './backpack.js';
import { icon } from './icon.js';

declare const window: BackpackWindow;

export class BackpackSolanaWallet implements Wallet {
    readonly #listeners: { [E in WalletEventNames]?: WalletEvents[E][] } = {};
    readonly #version = '1.0.0' as const;
    readonly #name = 'Backpack' as const;
    readonly #icon = icon;
    readonly #chains = [
        CHAIN_SOLANA_DEVNET,
        CHAIN_SOLANA_LOCALNET,
        CHAIN_SOLANA_MAINNET,
        CHAIN_SOLANA_TESTNET,
    ] as const;
    #account: BackpackSolanaWalletAccount | undefined;

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
        return this.#chains;
    }

    get features(): SolanaSignAndSendTransactionFeature & SignTransactionFeature & SignMessageFeature {
        return {
            'standard:solanaSignAndSendTransaction': {
                version: '1.0.0',
                solanaSignAndSendTransaction: this.#signAndSendTransaction,
            },
            'standard:signTransaction': {
                version: '1.0.0',
                signTransaction: this.#signTransaction,
            },
            'standard:signMessage': {
                version: '1.0.0',
                signMessage: this.#signMessage,
            },
        };
    }

    get accounts() {
        return this.#account ? [this.#account] : [];
    }

    constructor() {
        window.backpack.on('connect', this.#connect);
        window.backpack.on('disconnect', this.#disconnect);
        window.backpack.on('connectionDidChange', this.#reconnect);

        this.#connect();
    }

    async connect(input?: ConnectInput): Promise<ConnectOutput> {
        // TODO: determine if any of these need to be used
        const { chains, features, silent } = input || {};

        if (!silent && !window.backpack.isConnected) {
            await window.backpack.connect();
        }

        this.#connect();

        return { accounts: this.accounts };
    }

    on<E extends WalletEventNames>(event: E, listener: WalletEvents[E]): () => void {
        this.#listeners[event]?.push(listener) || (this.#listeners[event] = [listener]);
        return (): void => this.#off(event, listener);
    }

    #emit<E extends WalletEventNames>(event: E, ...args: Parameters<WalletEvents[E]>): void {
        // eslint-disable-next-line prefer-spread
        this.#listeners[event]?.forEach((listener) => listener.apply(null, args));
    }

    #off<E extends WalletEventNames>(event: E, listener: WalletEvents[E]): void {
        this.#listeners[event] = this.#listeners[event]?.filter((existingListener) => listener !== existingListener);
    }

    #connect = () => {
        const address = window.backpack.publicKey?.toBase58();
        if (!address) return;

        let chain: SolanaChain;
        const endpoint = window.backpack.connection.rpcEndpoint;
        if (endpoint === clusterApiUrl('devnet')) {
            chain = CHAIN_SOLANA_DEVNET;
        } else if (endpoint === clusterApiUrl('testnet')) {
            chain = CHAIN_SOLANA_TESTNET;
        } else if (/^https?:\/\/localhost[:/]/.test(endpoint)) {
            chain = CHAIN_SOLANA_LOCALNET;
        } else {
            chain = CHAIN_SOLANA_MAINNET;
        }

        const publicKey = window.backpack.publicKey!.toBytes();

        const account = this.#account;
        if (!account || account.chain !== chain || !bytesEqual(account.publicKey, publicKey)) {
            this.#account = new BackpackSolanaWalletAccount(publicKey, chain);
            this.#emit('standard:change', ['accounts']);
        }
    };

    #disconnect = () => {
        if (this.#account) {
            this.#account = undefined;
            this.#emit('standard:change', ['accounts']);
        }
    };

    #reconnect = () => {
        if (window.backpack.publicKey) {
            this.#connect();
        } else {
            this.#disconnect();
        }
    };

    #signAndSendTransaction: SolanaSignAndSendTransactionMethod = async (...inputs) => {
        const outputs: SolanaSignAndSendTransactionOutput[] = [];

        if (inputs.length === 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const input = inputs[0]!;
            const transaction = Transaction.from(input.transaction);
            const publicKey = new PublicKey(input.account.publicKey);
            const { commitment, preflightCommitment, skipPreflight, maxRetries, minContextSlot } = input.options || {};

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

        return outputs as any;
    };

    #signTransaction: SignTransactionMethod = async (...inputs) => {
        const outputs: SignTransactionOutput[] = [];

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
            const transactions = inputs.map(({ account, transaction }) => [
                account.publicKey,
                Transaction.from(transaction),
            ]);
            const signedTransactions = await window.backpack.signAllTransactions(
                transactions,
                new PublicKey(this.publicKey)
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

        return outputs as any;
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

        return outputs as any;
    };
}
