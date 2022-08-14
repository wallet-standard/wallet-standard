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
import type {
    SignAndSendTransactionFeature,
    SignMessageFeature,
    SignTransactionFeature,
    Wallet,
    WalletAccount,
    WalletPropertyNames,
    WalletsNavigator,
} from '@wallet-standard/standard';
import { encode } from 'bs58';

export interface StandardWalletAdapterConfig<
    Account extends WalletAccount & {
        features: SignAndSendTransactionFeature | SignTransactionFeature | SignMessageFeature;
    }
> {
    wallet: Wallet<Account>;
    // TODO: chain or endpoint?
}

export class StandardWalletAdapter<
    Account extends WalletAccount & {
        features: SignAndSendTransactionFeature | SignTransactionFeature | SignMessageFeature;
    }
> extends BaseWalletAdapter {
    readonly #wallet: Wallet<Account>;
    #account: Account | null;
    #publicKey: PublicKey | null;
    #connecting: boolean;
    readonly #readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.Installed;

    constructor({ wallet }: StandardWalletAdapterConfig<Account>) {
        super();
        this.#wallet = wallet;
        this.#account = null;
        this.#publicKey = null;
        this.#connecting = false;
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
            const destructors = [this.#wallet.on('change', this.#change)];

            (window.navigator as WalletsNavigator<Account>).wallets?.push({
                method: 'on',
                event: 'unregister',
                listener: (wallets) => {
                    if (wallets.includes(this.#wallet)) {
                        destructors.forEach((destroy) => destroy());
                        destructors.length = 0;
                    }
                },
                callback(off) {
                    destructors.push(off);
                },
            });

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

    async sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options: SendTransactionOptions = {}
    ): Promise<TransactionSignature> {
        try {
            if (!this.#account) throw new WalletNotConnectedError();
            if (!('signAndSendTransaction' in this.#account.features) && !('signTransaction' in this.#account.features))
                throw new WalletConfigError();

            // TODO: check if this.#wallet.accounts[0].chain matches connection

            try {
                transaction = await this.prepareTransaction(transaction, connection);

                // TODO: sendOptions handling?
                const { signers, ...sendOptions } = options;
                signers?.length && transaction.partialSign(...signers);

                sendOptions.preflightCommitment = sendOptions.preflightCommitment || connection.commitment;

                if ('signAndSendTransaction' in this.#account.features) {
                    const [{ signature }] = await this.#account.features.signAndSendTransaction.signAndSendTransaction({
                        transaction: transaction.serialize({
                            requireAllSignatures: false,
                            verifySignatures: false,
                        }),
                    });

                    return encode(signature);
                } else {
                    const [{ signedTransaction }] = await this.#account.features.signTransaction.signTransaction({
                        transaction: transaction.serialize({
                            requireAllSignatures: false,
                            verifySignatures: false,
                        }),
                    });

                    return await connection.sendRawTransaction(signedTransaction, sendOptions);
                }
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
    signAllTransactions: ((transaction: Transaction[]) => Promise<Transaction[]>) | undefined;
    signMessage: ((message: Uint8Array) => Promise<Uint8Array>) | undefined;

    #reconnect(account: Account | null) {
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

    #change = (properties: WalletPropertyNames<Account>[]) => {
        if (properties.includes('accounts')) {
            // FIXME
            this.#publicKey = null;
        }

        this.emit('error', new WalletDisconnectedError());
        this.emit('disconnect');
    };

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
