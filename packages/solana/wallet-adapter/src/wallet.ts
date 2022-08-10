import { Adapter, WalletReadyState } from '@solana/wallet-adapter-base';
import {
    ConnectInput,
    ConnectOutput,
    SignAndSendTransactionFeature,
    SignAndSendTransactionInputs,
    SignAndSendTransactionOutputs,
    SignMessageFeature,
    SignMessageInputs,
    SignMessageOutputs,
    SignTransactionFeature,
    SignTransactionInputs,
    SignTransactionOutputs,
    VERSION_1_0_0,
    Wallet,
    WalletAccount,
    WalletAccountFeatureNames,
    WalletEventNames,
    WalletEvents,
} from '@solana/wallet-standard';
import { initialize } from '@solana/wallet-standard-app';
import {
    bytesEqual,
    CHAIN_SOLANA_DEVNET,
    CHAIN_SOLANA_LOCALNET,
    CHAIN_SOLANA_MAINNET,
    CHAIN_SOLANA_TESTNET,
    concatBytes,
} from '@solana/wallet-standard-util';
import { clusterApiUrl, Connection, Transaction } from '@solana/web3.js';
import { decode } from 'bs58';

export type SolanaWalletAdapterChain =
    | typeof CHAIN_SOLANA_MAINNET
    | typeof CHAIN_SOLANA_DEVNET
    | typeof CHAIN_SOLANA_TESTNET
    | typeof CHAIN_SOLANA_LOCALNET;

export class SolanaWalletAdapterWalletAccount implements WalletAccount {
    readonly #adapter: Adapter;
    readonly #publicKey: Uint8Array;
    readonly #chain: SolanaWalletAdapterChain;

    get address() {
        return this.publicKey;
    }

    get publicKey() {
        return this.#publicKey.slice();
    }

    get chain() {
        return this.#chain;
    }

    get features(): SignAndSendTransactionFeature<this> &
        Partial<SignTransactionFeature<this> & SignMessageFeature<this>> {
        const signAndSendTransaction: SignAndSendTransactionFeature<this> = {
            signAndSendTransaction: { signAndSendTransaction: (...args) => this.#signAndSendTransaction(...args) },
        };

        let signTransactionFeature: SignTransactionFeature<this> | undefined = undefined;
        if ('signTransaction' in this.#adapter) {
            signTransactionFeature = {
                signTransaction: { signTransaction: (...args) => this.#signTransaction(...args) },
            };
        }

        let signMessageFeature: SignMessageFeature<this> | undefined = undefined;
        if ('signMessage' in this.#adapter) {
            signMessageFeature = { signMessage: { signMessage: (...args) => this.#signMessage(...args) } };
        }

        return { ...signAndSendTransaction, ...signTransactionFeature, ...signMessageFeature };
    }

    constructor(adapter: Adapter, publicKey: Uint8Array, chain: SolanaWalletAdapterChain) {
        this.#adapter = adapter;
        this.#publicKey = publicKey;
        this.#chain = chain;
    }

    async #signAndSendTransaction(
        inputs: SignAndSendTransactionInputs<this>
    ): Promise<SignAndSendTransactionOutputs<this>> {
        if (inputs.some((input) => !!input.extraSigners?.length)) throw new Error('extraSigners not implemented');

        const transactions = inputs.map(({ transaction }) => Transaction.from(transaction));

        if (transactions.length === 1) {
            let endpoint: string;
            if (this.#chain === CHAIN_SOLANA_MAINNET) {
                endpoint = clusterApiUrl('mainnet-beta');
            } else if (this.#chain === CHAIN_SOLANA_DEVNET) {
                endpoint = clusterApiUrl('devnet');
            } else if (this.#chain === CHAIN_SOLANA_TESTNET) {
                endpoint = clusterApiUrl('testnet');
            } else {
                endpoint = 'http://localhost:8899';
            }

            const connection = new Connection(endpoint, 'confirmed');
            const signature = await this.#adapter.sendTransaction(transactions[0], connection);

            return [{ signature: decode(signature) }];
        } else if (transactions.length > 1) {
            throw new Error('signAndSendTransaction for multiple transactions not implemented');
        } else {
            return [];
        }
    }

    async #signTransaction(inputs: SignTransactionInputs<this>): Promise<SignTransactionOutputs<this>> {
        if (!('signTransaction' in this.#adapter)) throw new Error('signTransaction not implemented by adapter');
        if (inputs.some((input) => !!input.extraSigners?.length)) throw new Error('extraSigners not implemented');

        const transactions = inputs.map(({ transaction }) => Transaction.from(transaction));

        let signedTransactions: Transaction[];
        if (transactions.length === 1) {
            signedTransactions = [await this.#adapter.signTransaction(transactions[0])];
        } else if (transactions.length > 1) {
            signedTransactions = await this.#adapter.signAllTransactions(transactions);
        } else {
            signedTransactions = [];
        }

        return signedTransactions.map((transaction) => ({
            signedTransaction: transaction.serialize({ requireAllSignatures: false }),
        }));
    }

    async #signMessage(inputs: SignMessageInputs<this>): Promise<SignMessageOutputs<this>> {
        if (!('signMessage' in this.#adapter)) throw new Error('signMessage not implemented by adapter');
        if (inputs.some((input) => !!input.extraSigners?.length)) throw new Error('extraSigners not implemented');

        if (inputs.length === 1) {
            const signature = await this.#adapter.signMessage(inputs[0].message);
            const signedMessage = concatBytes(inputs[0].message, signature);
            return [{ signedMessage }];
        } else if (inputs.length > 1) {
            throw new Error('signMessage for multiple messages not implemented');
        } else {
            return [];
        }
    }
}

export class SolanaWalletAdapterWallet implements Wallet<SolanaWalletAdapterWalletAccount> {
    #listeners: {
        [E in WalletEventNames<SolanaWalletAdapterWalletAccount>]?: WalletEvents<SolanaWalletAdapterWalletAccount>[E][];
    } = {};
    #adapter: Adapter;
    #chain: SolanaWalletAdapterChain;
    #account: SolanaWalletAdapterWalletAccount | undefined;

    get version() {
        return VERSION_1_0_0;
    }

    get name() {
        return this.#adapter.name;
    }

    get icon() {
        return this.#adapter.icon;
    }

    get chains() {
        return [this.#chain];
    }

    get features() {
        const features: WalletAccountFeatureNames<SolanaWalletAdapterWalletAccount>[] = ['signAndSendTransaction'];
        if ('signTransaction' in this.#adapter) {
            features.push('signTransaction');
        }
        if ('signMessage' in this.#adapter) {
            features.push('signMessage');
        }
        return features;
    }

    get accounts() {
        return this.#account ? [this.#account] : [];
    }

    get hasMoreAccounts() {
        return false;
    }

    constructor(adapter: Adapter, chain: SolanaWalletAdapterChain) {
        this.#adapter = adapter;
        this.#chain = chain;

        adapter.on('connect', this.#connect, this);
        adapter.on('disconnect', this.#disconnect, this);

        this.#connect();
    }

    destroy(): void {
        this.#adapter.off('connect', this.#connect, this);
        this.#adapter.off('disconnect', this.#disconnect, this);
    }

    async connect<
        Chain extends SolanaWalletAdapterWalletAccount['chain'],
        FeatureNames extends WalletAccountFeatureNames<SolanaWalletAdapterWalletAccount>,
        Input extends ConnectInput<SolanaWalletAdapterWalletAccount, Chain, FeatureNames>
    >({
        chains,
        addresses,
        features,
        silent,
    }: Input): Promise<ConnectOutput<SolanaWalletAdapterWalletAccount, Chain, FeatureNames, Input>> {
        if (!silent && !this.#adapter.connected) {
            await this.#adapter.connect();
        }

        if (chains?.length) {
            if (chains.length > 1) throw new Error('multiple chains not supported');
            this.#chain = chains[0];
        }

        this.#connect();

        return {
            accounts: this.accounts as any, // FIXME
            hasMoreAccounts: false,
        };
    }

    on<E extends WalletEventNames<SolanaWalletAdapterWalletAccount>>(
        event: E,
        listener: WalletEvents<SolanaWalletAdapterWalletAccount>[E]
    ): () => void {
        this.#listeners[event]?.push(listener) || (this.#listeners[event] = [listener]);
        return (): void => this.#off(event, listener);
    }

    #emit<E extends WalletEventNames<SolanaWalletAdapterWalletAccount>>(
        event: E,
        ...args: Parameters<WalletEvents<SolanaWalletAdapterWalletAccount>[E]>
    ): void {
        // eslint-disable-next-line prefer-spread
        this.#listeners[event]?.forEach((listener) => listener.apply(null, args));
    }

    #off<E extends WalletEventNames<SolanaWalletAdapterWalletAccount>>(
        event: E,
        listener: WalletEvents<SolanaWalletAdapterWalletAccount>[E]
    ): void {
        this.#listeners[event] = this.#listeners[event]?.filter((existingListener) => listener !== existingListener);
    }

    #connect(): void {
        const publicKey = this.#adapter.publicKey?.toBytes();
        if (publicKey) {
            const account = this.#account;
            if (!account || account.chain !== this.#chain || !bytesEqual(account.publicKey, publicKey)) {
                this.#account = new SolanaWalletAdapterWalletAccount(this.#adapter, publicKey, this.#chain);
                this.#emit('change', ['accounts']);
            }
        }
    }

    #disconnect(): void {
        if (this.#account) {
            this.#account = undefined;
            this.#emit('change', ['accounts']);
        }
    }
}

/**
 * TODO: docs
 *
 * @param adapter TODO: docs
 * @param chain   TODO: docs
 * @param match   TODO: docs
 */
export function registerWalletAdapter(
    adapter: Adapter,
    chain: SolanaWalletAdapterChain,
    match: (wallet: Wallet<SolanaWalletAdapterWalletAccount>) => boolean = (wallet) => wallet.name === adapter.name
): () => void {
    const wallets = initialize<SolanaWalletAdapterWalletAccount>();
    const destructors: (() => void)[] = [];

    function destroy(): void {
        destructors.forEach((destroy) => destroy());
        destructors.length = 0;
    }

    function setup(): boolean {
        // If the adapter is unsupported, or a standard wallet that matches it has already been registered, do nothing.
        if (adapter.readyState === WalletReadyState.Unsupported || wallets.get().some(match)) return true;

        // If the adapter isn't ready, try again later.
        const ready =
            adapter.readyState === WalletReadyState.Installed || adapter.readyState === WalletReadyState.Loadable;
        if (ready) {
            const wallet = new SolanaWalletAdapterWallet(adapter, chain);
            destructors.push(() => wallet.destroy());
            // Register the adapter wrapped as a standard wallet, and receive a function to unregister the adapter.
            destructors.push(wallets.register([wallet]));
            // Whenever a standard wallet is registered ...
            destructors.push(
                wallets.on('register', (wallets) => {
                    // ... check if it matches the adapter.
                    if (wallets.some(match)) {
                        // If it does, remove the event listener and unregister the adapter.
                        destroy();
                    }
                })
            );
        }
        return ready;
    }

    if (!setup()) {
        function listener(): void {
            if (setup()) {
                adapter.off('readyStateChange', listener);
            }
        }

        adapter.on('readyStateChange', listener);
        destructors.push(() => adapter.off('readyStateChange', listener));
    }

    return destroy;
}
