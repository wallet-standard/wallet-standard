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
import { VERSION_1_0_0 } from '@wallet-standard/standard';
import {
    bytesEqual,
    CHAIN_SOLANA_DEVNET,
    CHAIN_SOLANA_LOCALNET,
    CHAIN_SOLANA_MAINNET,
    CHAIN_SOLANA_TESTNET,
    SolanaChain,
} from '@wallet-standard/util';
import { decode } from 'bs58';
import { BackpackWindow } from './backpack';
import { icon } from './icon';

declare const window: BackpackWindow;

export class BackpackSolanaWalletAccount implements WalletAccount {
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
            solana: { signAndSendTransaction: this.#signAndSendTransaction },
            signTransaction: { signTransaction: this.#signTransaction },
            signMessage: { signMessage: this.#signMessage },
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
        if (inputs.length === 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const input = inputs[0]!;
            const transaction = Transaction.from(input.transaction);
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
                      new PublicKey(this.publicKey)
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
                      new PublicKey(this.publicKey)
                  );

            return [{ signature: decode(signature) }];
        } else if (inputs.length > 1) {
            const outputs: SolanaSignAndSendTransactionOutput[] = [];
            for (const input of inputs) {
                outputs.push(...(await this.#signAndSendTransaction(input)));
            }
            return outputs;
        } else {
            return [] as any;
        }
    };

    #signTransaction: SignTransactionMethod = async (...inputs) => {
        const transactions = inputs.map(({ transaction }) => Transaction.from(transaction));

        let signedTransactions: Transaction[];
        if (transactions.length === 1) {
            signedTransactions = [
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                await window.backpack.signTransaction(transactions[0]!, new PublicKey(this.publicKey)),
            ];
        } else if (transactions.length > 1) {
            signedTransactions = await window.backpack.signAllTransactions(transactions, new PublicKey(this.publicKey));
        } else {
            signedTransactions = [];
        }

        const outputs: SignTransactionOutput[] = signedTransactions.map((transaction) => ({
            signedTransaction: transaction.serialize({
                requireAllSignatures: false,
                verifySignatures: false,
            }),
        }));

        return outputs as any;
    };

    #signMessage: SignMessageMethod = async (...inputs) => {
        if (inputs.length === 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const signedMessage = inputs[0]!.message;
            const signature = await window.backpack.signMessage(signedMessage, new PublicKey(this.publicKey));
            return [{ signedMessage, signatures: [signature] }];
        } else if (inputs.length > 1) {
            const outputs: SignMessageOutput[] = [];
            for (const input of inputs) {
                outputs.push(...(await this.#signMessage(input)));
            }
            return outputs;
        } else {
            return [] as any;
        }
    };
}

export class BackpackSolanaWallet implements Wallet<BackpackSolanaWalletAccount> {
    #listeners: {
        [E in WalletEventNames<BackpackSolanaWalletAccount>]?: WalletEvents<BackpackSolanaWalletAccount>[E][];
    } = {};
    #account: BackpackSolanaWalletAccount | undefined;

    get version() {
        return VERSION_1_0_0;
    }

    get name() {
        return 'Backpack';
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
        window.backpack.on('connect', this._connect, this);
        window.backpack.on('disconnect', this._disconnect, this);
        window.backpack.on('connectionDidChange', this._reconnect, this);

        this._connect();
    }

    async connect<
        Chain extends BackpackSolanaWalletAccount['chain'],
        FeatureName extends WalletAccountFeatureName<BackpackSolanaWalletAccount>,
        ExtensionName extends WalletAccountExtensionName<BackpackSolanaWalletAccount>,
        Input extends ConnectInput<BackpackSolanaWalletAccount, Chain, FeatureName, ExtensionName>
    >(input?: Input): Promise<ConnectOutput<BackpackSolanaWalletAccount, Chain, FeatureName, ExtensionName, Input>> {
        // TODO: determine if any of these need to be used
        const { chains, features, extensions, addresses, silent } = input || {};

        if (!silent && !window.backpack.isConnected) {
            await window.backpack.connect();
        }

        this._connect();

        return {
            accounts: this.accounts as any,
            hasMoreAccounts: false,
        };
    }

    on<E extends WalletEventNames<BackpackSolanaWalletAccount>>(
        event: E,
        listener: WalletEvents<BackpackSolanaWalletAccount>[E]
    ): () => void {
        this.#listeners[event]?.push(listener) || (this.#listeners[event] = [listener]);
        return (): void => this.#off(event, listener);
    }

    #emit<E extends WalletEventNames<BackpackSolanaWalletAccount>>(
        event: E,
        ...args: Parameters<WalletEvents<BackpackSolanaWalletAccount>[E]>
    ): void {
        // eslint-disable-next-line prefer-spread
        this.#listeners[event]?.forEach((listener) => listener.apply(null, args));
    }

    #off<E extends WalletEventNames<BackpackSolanaWalletAccount>>(
        event: E,
        listener: WalletEvents<BackpackSolanaWalletAccount>[E]
    ): void {
        this.#listeners[event] = this.#listeners[event]?.filter((existingListener) => listener !== existingListener);
    }

    private _connect(): void {
        const publicKey = window.backpack.publicKey?.toBytes();
        if (!publicKey) return;

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

        const account = this.#account;
        if (!account || account.chain !== chain || !bytesEqual(account.publicKey, publicKey)) {
            this.#account = new BackpackSolanaWalletAccount(publicKey, chain);
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
        if (window.backpack.publicKey) {
            this._connect();
        } else {
            this._disconnect();
        }
    }
}
