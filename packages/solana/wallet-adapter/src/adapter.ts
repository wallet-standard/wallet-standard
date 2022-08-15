import type { SendTransactionOptions, WalletName } from '@solana/wallet-adapter-base';
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
import { initialize } from '@wallet-standard/app';
import { getCommitment } from '@wallet-standard/solana-web3.js';
import type {
    SignMessageFeature,
    SignTransactionFeature,
    SolanaFeature,
    Wallet,
    WalletAccount,
    WalletPropertyNames,
} from '@wallet-standard/standard';
import { encode } from 'bs58';

export interface StandardWalletAdapterAccount extends WalletAccount {
    features: SolanaFeature & (SignTransactionFeature | SignMessageFeature);
}

export function isStandardWalletAdapterCompatibleWallet(
    wallet: Wallet<WalletAccount>
): wallet is Wallet<StandardWalletAdapterAccount> {
    return wallet.features.includes('solana');
}

export interface StandardWalletAdapterConfig {
    wallet: Wallet<StandardWalletAdapterAccount>;
    // TODO: chain or endpoint?
}

export class StandardWalletAdapter extends BaseWalletAdapter {
    readonly #wallet: Wallet<StandardWalletAdapterAccount>;
    #account: StandardWalletAdapterAccount | null;
    #publicKey: PublicKey | null;
    #connecting: boolean;
    #destructors: Array<() => void>;
    readonly #readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.Installed;

    constructor({ wallet }: StandardWalletAdapterConfig) {
        super();
        this.#wallet = wallet;
        this.#account = null;
        this.#publicKey = null;
        this.#connecting = false;
        this.#destructors = [];
    }

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

    get connected() {
        return !!this.#publicKey;
    }

    get readyState() {
        return this.#readyState;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this.#readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

            this.#connecting = true;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            if (!this.#wallet.accounts.length) {
                try {
                    await this.#wallet.connect();
                } catch (error: any) {
                    throw new WalletConnectionError(error?.message, error);
                }
            }

            if (!this.#wallet.accounts.length) throw new WalletAccountError();
            const account = this.#wallet.accounts[0];

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(account.publicKey);
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            // FIXME
            // Listen for property changes on the wallet, and remove the listener if the wallet is unregistered
            this.#destructors = [
                this.#wallet.on('change', this.#change),
                initialize<WalletAccount>().on('unregister', (wallets) => {
                    if (wallets.includes(this.#wallet)) {
                        this.#destructors.forEach((destroy) => destroy());
                        this.#destructors.length = 0;
                    }
                }),
            ];

            this.#reconnect(account);
            this.emit('connect', publicKey);
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        } finally {
            this.#connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        this.#reconnect(null);
        this.emit('disconnect');
    }

    #reconnect(account: StandardWalletAdapterAccount | null) {
        this.#account = account;
        this.#publicKey = account ? new PublicKey(account.publicKey) : null;

        let signTransaction = false;
        let signMessage = false;
        if (account) {
            signTransaction = 'signTransaction' in account.features;
            signMessage = 'signMessage' in account.features;
        }

        if (signTransaction) {
            this.signTransaction = this.#signTransaction;
            this.signAllTransactions = this.#signAllTransactions;
        } else {
            this.signTransaction = undefined;
            this.signAllTransactions = undefined;
        }

        if (signMessage) {
            this.signMessage = this.#signMessage;
        } else {
            this.signMessage = undefined;
        }
    }

    #change = (properties: WalletPropertyNames<StandardWalletAdapterAccount>[]) => {
        if (properties.includes('accounts')) {
            // FIXME
            this.#publicKey = null;
        }

        this.emit('error', new WalletDisconnectedError());
        this.emit('disconnect');
    };

    async sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options: SendTransactionOptions = {}
    ): Promise<TransactionSignature> {
        try {
            if (!this.#account) throw new WalletNotConnectedError();

            // TODO: check if this.#wallet.accounts[0].chain matches connection

            try {
                const { signers, ...sendOptions } = options;

                transaction = await this.prepareTransaction(transaction, connection, sendOptions);

                signers?.length && transaction.partialSign(...signers);

                const [{ signature }] = await this.#account.features.solana.signAndSendTransaction({
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
            if (!this.#account) throw new WalletNotConnectedError();
            if (!('signTransaction' in this.#account.features)) throw new WalletConfigError();

            try {
                const [{ signedTransaction }] = await this.#account.features.signTransaction.signTransaction({
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
            if (!this.#account) throw new WalletNotConnectedError();
            if (!('signTransaction' in this.#account.features)) throw new WalletConfigError();

            try {
                const signedTransactions = await this.#account.features.signTransaction.signTransaction(
                    ...transactions.map((transaction) => ({
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
            if (!this.#account) throw new WalletNotConnectedError();
            if (!('signMessage' in this.#account.features)) throw new WalletConfigError();

            try {
                const [{ signature }] = await this.#account.features.signMessage.signMessage({ message });
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
