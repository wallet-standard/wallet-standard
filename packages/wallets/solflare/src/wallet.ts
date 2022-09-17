import { clusterApiUrl, PublicKey, Transaction } from '@solana/web3.js';
import type {
    SignMessageFeature,
    SignMessageMethod,
    SignMessageOutput,
    SignTransactionFeature,
    SignTransactionMethod,
    SignTransactionOutput,
    SolanaFeature,
    SolanaSignAndSendTransactionMethod,
    SolanaSignAndSendTransactionOutput,
} from '@wallet-standard/features';
import type {
    ConnectInput,
    ConnectOutput,
    Wallet,
    WalletAccount,
    WalletAccountExtensionName,
    WalletAccountFeatureName,
    WalletEventNames,
    WalletEvents,
} from '@wallet-standard/standard';
import type { SolanaChain } from '@wallet-standard/util';
import {
    bytesEqual,
    CHAIN_SOLANA_DEVNET,
    CHAIN_SOLANA_LOCALNET,
    CHAIN_SOLANA_MAINNET,
    CHAIN_SOLANA_TESTNET,
} from '@wallet-standard/util';
import { decode } from 'bs58';
import type { SolflareWindow } from './solflare.js';
import { icon } from './icon.js';

declare const window: SolflareWindow;

export class SolflareSolanaWalletAccount implements WalletAccount {
    readonly #publicKey: Uint8Array;
    readonly #chain: SolanaChain;

    get address() {
        return this.publicKey;
    }

    get publicKey() {
        return this.#publicKey;
    }

    get chain() {
        return this.#chain;
    }

    get features(): SolanaFeature & SignTransactionFeature & SignMessageFeature {
        return {
            solana: {
                version: '1.0.0',
                signAndSendTransaction: this.#signAndSendTransaction,
            },
            signTransaction: {
                version: '1.0.0',
                signTransaction: this.#signTransaction,
            },
            signMessage: {
                version: '1.0.0',
                signMessage: this.#signMessage,
            },
        };
    }

    get extensions() {
        return {};
    }

    constructor(publicKey: Uint8Array, chain: SolanaChain) {
        this.#publicKey = publicKey;
        this.#chain = chain;
    }

    #signAndSendTransaction: SolanaSignAndSendTransactionMethod = async (...inputs) => {
        const outputs: SolanaSignAndSendTransactionOutput[] = [];

        if (inputs.length === 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const input = inputs[0]!;
            const transaction = Transaction.from(input.transaction);
            const { commitment, preflightCommitment, skipPreflight, maxRetries, minContextSlot } = input.options || {};

            // TODO: sign and send transaction
            const signature = commitment
                ? await window.solflare.sendAndConfirm(
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
                      new PublicKey(this.publicKey)
                  )
                : await window.solflare.send(
                      transaction,
                      [],
                      {
                          preflightCommitment,
                          skipPreflight,
                          maxRetries,
                          minContextSlot,
                      },
                      undefined,
                      new PublicKey(this.publicKey)
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
            const transaction = Transaction.from(inputs[0]!.transaction);
            const signedTransaction = await window.solflare.signTransaction(transaction, new PublicKey(this.publicKey));

            outputs.push({
                signedTransaction: signedTransaction.serialize({
                    requireAllSignatures: false,
                    verifySignatures: false,
                }),
            });
        } else if (inputs.length > 1) {
            const transactions = inputs.map(({ transaction }) => Transaction.from(transaction));
            const signedTransactions = await window.solflare.signAllTransactions(
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
            const signedMessage = inputs[0]!.message;
            const signature = await window.solflare.signMessage(signedMessage, new PublicKey(this.publicKey));

            outputs.push({ signedMessage, signature });
        } else if (inputs.length > 1) {
            for (const input of inputs) {
                outputs.push(...(await this.#signMessage(input)));
            }
        }

        return outputs as any;
    };
}

export class SolflareSolanaWallet implements Wallet<SolflareSolanaWalletAccount> {
    #listeners: {
        [E in WalletEventNames<SolflareSolanaWalletAccount>]?: WalletEvents<SolflareSolanaWalletAccount>[E][];
    } = {};
    #account: SolflareSolanaWalletAccount | undefined;

    get version() {
        return '1.0.0' as const;
    }

    get name() {
        return 'Solflare';
    }

    get icon() {
        return icon;
    }

    get chains() {
        return this.#account ? [this.#account.chain] : [];
    }

    get features() {
        return ['solana' as const, 'signTransaction' as const, 'signMessage' as const];
    }

    get extensions() {
        return [] as const;
    }

    get accounts() {
        return this.#account ? [this.#account] : [];
    }

    get hasMoreAccounts() {
        return false;
    }

    constructor() {
        window.solflare.on('connect', this._connect, this);
        window.solflare.on('disconnect', this._disconnect, this);
        window.solflare.on('connectionDidChange', this._reconnect, this);

        this._connect();
    }

    async connect<
        Chain extends SolflareSolanaWalletAccount['chain'],
        FeatureName extends WalletAccountFeatureName<SolflareSolanaWalletAccount>,
        ExtensionName extends WalletAccountExtensionName<SolflareSolanaWalletAccount>,
        Input extends ConnectInput<SolflareSolanaWalletAccount, Chain, FeatureName, ExtensionName>
    >(input?: Input): Promise<ConnectOutput<SolflareSolanaWalletAccount, Chain, FeatureName, ExtensionName, Input>> {
        // TODO: determine if any of these need to be used
        const { chains, features, extensions, addresses, silent } = input || {};

        if (!silent && !window.solflare.isConnected) {
            await window.solflare.connect();
        }

        this._connect();

        return {
            accounts: this.accounts as any,
            hasMoreAccounts: false,
        };
    }

    on<E extends WalletEventNames<SolflareSolanaWalletAccount>>(
        event: E,
        listener: WalletEvents<SolflareSolanaWalletAccount>[E]
    ): () => void {
        this.#listeners[event]?.push(listener) || (this.#listeners[event] = [listener]);
        return (): void => this.#off(event, listener);
    }

    #emit<E extends WalletEventNames<SolflareSolanaWalletAccount>>(
        event: E,
        ...args: Parameters<WalletEvents<SolflareSolanaWalletAccount>[E]>
    ): void {
        // eslint-disable-next-line prefer-spread
        this.#listeners[event]?.forEach((listener) => listener.apply(null, args));
    }

    #off<E extends WalletEventNames<SolflareSolanaWalletAccount>>(
        event: E,
        listener: WalletEvents<SolflareSolanaWalletAccount>[E]
    ): void {
        this.#listeners[event] = this.#listeners[event]?.filter((existingListener) => listener !== existingListener);
    }

    private _connect(): void {
        const publicKey = window.solflare.publicKey?.toBytes();
        if (!publicKey) return;

        let chain: SolanaChain;
        const endpoint = window.solflare.connection?.rpcEndpoint;
        if (endpoint === clusterApiUrl('devnet')) {
            chain = CHAIN_SOLANA_DEVNET;
        } else if (endpoint === clusterApiUrl('testnet')) {
            chain = CHAIN_SOLANA_TESTNET;
        } else if (/^https?:\/\/localhost[:/]/.test(endpoint)) {
            chain = CHAIN_SOLANA_LOCALNET;
        } else {
            chain = CHAIN_SOLANA_MAINNET;
        }

        const account = this.#account;
        if (!account || account.chain !== chain || !bytesEqual(account.publicKey, publicKey)) {
            this.#account = new SolflareSolanaWalletAccount(publicKey, chain);
            this.#emit('change', ['accounts', 'chains']);
        }
    }

    private _disconnect(): void {
        if (this.#account) {
            this.#account = undefined;
            this.#emit('change', ['accounts', 'chains']);
        }
    }

    private _reconnect(): void {
        if (window.solflare.publicKey) {
            this._connect();
        } else {
            this._disconnect();
        }
    }
}
