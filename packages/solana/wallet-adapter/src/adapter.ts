import type { SendTransactionOptions, WalletAdapter, WalletName } from '@solana/wallet-adapter-base';
import {
    BaseWalletAdapter,
    WalletAccountError,
    WalletConfigError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSendTransactionError,
    WalletSignMessageError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import type { Connection, TransactionSignature } from '@solana/web3.js';
import { PublicKey, Transaction } from '@solana/web3.js';
import type {
    ConnectFeature,
    SignMessageFeature,
    SolanaSignAndSendTransactionFeature,
    SolanaSignTransactionFeature,
    WalletWithFeatures,
} from '@wallet-standard/features';
import { getChainForEndpoint, getCommitment } from '@wallet-standard/solana-web3.js';
import type { Wallet, WalletAccount, WalletPropertyName } from '@wallet-standard/standard';
import { encode } from 'bs58';

/** TODO: docs */
export type StandardWalletAdapterWallet = WalletWithFeatures<
    ConnectFeature & SolanaSignAndSendTransactionFeature & (SolanaSignTransactionFeature | SignMessageFeature)
>;

/** TODO: docs */
export function isStandardWalletAdapterCompatibleWallet(wallet: Wallet): wallet is StandardWalletAdapterWallet {
    return 'standard:connect' in wallet.features && 'standard:solanaSignAndSendTransaction' in wallet.features;
}

/** TODO: docs */
export interface StandardWalletAdapterConfig {
    wallet: StandardWalletAdapterWallet;
}

/** TODO: docs */
export type StandardAdapter = WalletAdapter & {
    wallet: StandardWalletAdapterWallet;
    standard: true;
};

/** TODO: docs */
export class StandardWalletAdapter extends BaseWalletAdapter implements StandardAdapter {
    readonly supportedTransactionVersions = null;

    #account: WalletAccount | null;
    #publicKey: PublicKey | null;
    #connecting: boolean;
    #off: (() => void) | undefined;
    readonly #wallet: StandardWalletAdapterWallet;
    readonly #readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.Installed;

    get name() {
        return this.#wallet.name as WalletName;
    }

    get icon() {
        return this.#wallet.icon;
    }

    get url() {
        return 'https://github.com/wallet-standard';
    }

    get publicKey() {
        return this.#publicKey;
    }

    get connecting() {
        return this.#connecting;
    }

    get readyState() {
        return this.#readyState;
    }

    get wallet(): StandardWalletAdapterWallet {
        return this.#wallet;
    }

    get standard() {
        return true as const;
    }

    constructor({ wallet }: StandardWalletAdapterConfig) {
        super();
        this.#wallet = wallet;
        this.#account = null;
        this.#publicKey = null;
        this.#connecting = false;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this.#readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

            this.#connecting = true;

            if (!this.#wallet.accounts.length) {
                try {
                    await this.#wallet.features['standard:connect'].connect();
                } catch (error: any) {
                    throw new WalletConnectionError(error?.message, error);
                }
            }

            if (!this.#wallet.accounts.length) throw new WalletAccountError();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const account = this.#wallet.accounts[0]!;

            // TODO: account selection?

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(account.publicKey);
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            this.#off = this.#wallet.on('standard:change', this.#changed);
            this.#connected(account, publicKey);
            this.emit('connect', publicKey);
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        } finally {
            this.#connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        this.#disconnected();
        this.emit('disconnect');
    }

    #connected(account: WalletAccount, publicKey: PublicKey): void;
    #connected(account: null, publicKey: null): void;
    #connected(account: WalletAccount | null, publicKey: PublicKey | null) {
        this.#account = account;
        this.#publicKey = publicKey;

        if (account && 'standard:solanaSignTransaction' in account.features) {
            this.signTransaction = this.#signTransaction;
            this.signAllTransactions = this.#signAllTransactions;
        } else {
            this.signTransaction = undefined;
            this.signAllTransactions = undefined;
        }

        if (account && 'standard:signMessage' in account.features) {
            this.signMessage = this.#signMessage;
        } else {
            this.signMessage = undefined;
        }
    }

    #disconnected(): void {
        const off = this.#off;
        if (off) {
            this.#off = undefined;
            off();
        }

        this.#connected(null, null);
    }

    #changed = (properties: ReadonlyArray<WalletPropertyName>) => {
        // If the adapter isn't connected or the change doesn't include accounts, do nothing.
        if (!this.#account || !this.#publicKey || properties.includes('accounts')) return;

        const account = this.#wallet.accounts[0];
        // If there's no connected account, disconnect the adapter.
        if (!account) {
            this.#disconnected();
            this.emit('error', new WalletDisconnectedError());
            this.emit('disconnect');
            return;
        }

        // If the account hasn't actually changed, do nothing.
        if (account === this.#account) return;

        let publicKey: PublicKey;
        // If the account public key isn't valid, disconnect the adapter.
        try {
            publicKey = new PublicKey(account.publicKey);
        } catch (error: any) {
            this.#disconnected();
            this.emit('error', new WalletPublicKeyError(error?.message));
            this.emit('disconnect');
            return;
        }

        // Change the adapter's account and public key and emit an event.
        this.#connected(account, publicKey);
        this.emit('connect', publicKey);
    };

    async sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options: SendTransactionOptions = {}
    ): Promise<TransactionSignature> {
        try {
            if (!this.#account) throw new WalletNotConnectedError();

            const chain = getChainForEndpoint(connection.rpcEndpoint);
            if (!this.#account.chains.includes(chain)) throw new WalletSendTransactionError();

            try {
                const { signers, ...sendOptions } = options;

                transaction = await this.prepareTransaction(transaction, connection, sendOptions);

                signers?.length && transaction.partialSign(...signers);

                const [{ signature }] = await this.#wallet.features[
                    'standard:solanaSignAndSendTransaction'
                ].solanaSignAndSendTransaction({
                    account: this.#account,
                    chain,
                    transaction: transaction.serialize({
                        requireAllSignatures: false,
                        verifySignatures: false,
                    }),
                    options: {
                        preflightCommitment: getCommitment(sendOptions.preflightCommitment || connection.commitment),
                        skipPreflight: sendOptions.skipPreflight,
                        maxRetries: sendOptions.maxRetries,
                        minContextSlot: sendOptions.minContextSlot,
                    },
                });

                return encode(signature);
            } catch (error: any) {
                if (error instanceof WalletError) throw error;
                throw new WalletSendTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    signTransaction: ((transaction: Transaction) => Promise<Transaction>) | undefined;
    async #signTransaction(transaction: Transaction): Promise<Transaction> {
        try {
            if (!('standard:solanaSignTransaction' in this.#wallet.features)) throw new WalletConfigError();
            const account = this.#account;
            if (!account?.features.includes('standard:solanaSignTransaction')) throw new WalletSignTransactionError();

            try {
                const [{ signedTransaction }] = await this.#wallet.features[
                    'standard:solanaSignTransaction'
                ].solanaSignTransaction({
                    account,
                    transaction: transaction.serialize({
                        requireAllSignatures: false,
                        verifySignatures: false,
                    }),
                });

                return Transaction.from(signedTransaction);
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    signAllTransactions: ((transaction: Transaction[]) => Promise<Transaction[]>) | undefined;
    async #signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
        try {
            if (!('standard:solanaSignTransaction' in this.#wallet.features)) throw new WalletConfigError();
            const account = this.#account;
            if (!account?.features.includes('standard:solanaSignTransaction')) throw new WalletSignTransactionError();

            try {
                const signedTransactions = await this.#wallet.features[
                    'standard:solanaSignTransaction'
                ].solanaSignTransaction(
                    ...transactions.map((transaction) => ({
                        account,
                        transaction: transaction.serialize({
                            requireAllSignatures: false,
                            verifySignatures: false,
                        }),
                    }))
                );

                return signedTransactions.map(({ signedTransaction }) => Transaction.from(signedTransaction));
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    signMessage: ((message: Uint8Array) => Promise<Uint8Array>) | undefined;
    async #signMessage(message: Uint8Array): Promise<Uint8Array> {
        try {
            if (!('standard:signMessage' in this.#wallet.features)) throw new WalletConfigError();
            const account = this.#account;
            if (!account?.features.includes('standard:signMessage')) throw new WalletSignMessageError();

            try {
                const [{ signature }] = await this.#wallet.features['standard:signMessage'].signMessage({
                    account,
                    message,
                });
                return signature;
            } catch (error: any) {
                throw new WalletSignMessageError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }
}
