import { Adapter, WalletReadyState } from '@solana/wallet-adapter-base';
import {
    Bytes,
    bytesEqual,
    CHAIN_SOLANA_DEVNET,
    CHAIN_SOLANA_LOCALNET,
    CHAIN_SOLANA_MAINNET,
    CHAIN_SOLANA_TESTNET,
    concatBytes,
    ConnectInput,
    ConnectOutput,
    initialize,
    SignAndSendTransactionInput,
    SignAndSendTransactionMethod,
    SignAndSendTransactionOutput,
    SignMessageInput,
    SignMessageMethod,
    SignMessageOutput,
    SignTransactionInput,
    SignTransactionMethod,
    SignTransactionOutput,
    Wallet,
    WalletAccount,
    WalletAccountMethodNames,
    WalletEventNames,
    WalletEvents,
} from '@solana/wallet-standard';
import { clusterApiUrl, Connection, Transaction, TransactionSignature } from '@solana/web3.js';
import { decode } from 'bs58';

export type SolanaWalletAdapterChain =
    | typeof CHAIN_SOLANA_MAINNET
    | typeof CHAIN_SOLANA_DEVNET
    | typeof CHAIN_SOLANA_TESTNET
    | typeof CHAIN_SOLANA_LOCALNET;

export class SolanaWalletAdapterWalletAccount implements WalletAccount {
    private _adapter: Adapter;
    private _publicKey: Bytes;
    private _chain: SolanaWalletAdapterChain;

    get address() {
        return this.publicKey;
    }

    get publicKey() {
        return new Uint8Array(this._publicKey);
    }

    get chain() {
        return this._chain;
    }

    get ciphers() {
        return [];
    }

    get methods(): SignTransactionMethod<this> | SignAndSendTransactionMethod<this> | SignMessageMethod<this> {
        const methods: SignAndSendTransactionMethod<this> &
            Partial<SignTransactionMethod<this> & SignMessageMethod<this>> = {
            signAndSendTransaction: (...args) => this._signAndSendTransaction(...args),
        };

        if ('signTransaction' in this._adapter) {
            methods.signTransaction = (...args) => this._signTransaction(...args);
        }

        if ('signMessage' in this._adapter) {
            methods.signMessage = (...args) => this._signMessage(...args);
        }

        return methods;
    }

    constructor(adapter: Adapter, publicKey: Bytes, chain: SolanaWalletAdapterChain) {
        this._adapter = adapter;
        this._publicKey = publicKey;
        this._chain = chain;
    }

    private async _signAndSendTransaction(
        input: SignAndSendTransactionInput<this>
    ): Promise<SignAndSendTransactionOutput<this>> {
        if (input.extraSigners?.length) throw new Error('extraSigners not implemented');
        const transactions = input.transactions.map((rawTransaction) => Transaction.from(rawTransaction));

        let signatures: TransactionSignature[];
        if (transactions.length === 1) {
            let endpoint: string;
            if (this._chain === CHAIN_SOLANA_MAINNET) {
                endpoint = clusterApiUrl('mainnet-beta');
            } else if (this._chain === CHAIN_SOLANA_DEVNET) {
                endpoint = clusterApiUrl('devnet');
            } else if (this._chain === CHAIN_SOLANA_TESTNET) {
                endpoint = clusterApiUrl('testnet');
            } else {
                endpoint = 'http://localhost:8899';
            }

            const connection = new Connection(endpoint, 'confirmed');
            const signature = await this._adapter.sendTransaction(transactions[0], connection);

            signatures = [signature];
        } else if (transactions.length > 1) {
            throw new Error('signAndSendTransaction for multiple transactions not implemented');
        } else {
            signatures = [];
        }

        return { signatures: signatures.map((signature) => decode(signature)) };
    }

    private async _signTransaction(input: SignTransactionInput<this>): Promise<SignTransactionOutput<this>> {
        if (input.extraSigners?.length) throw new Error('extraSigners not implemented');
        if (!('signTransaction' in this._adapter)) throw new Error('signTransaction not implemented by adapter');

        const transactions = input.transactions.map((rawTransaction) => Transaction.from(rawTransaction));

        let signedTransactions: Transaction[];
        if (transactions.length === 1) {
            signedTransactions = [await this._adapter.signTransaction(transactions[0])];
        } else if (transactions.length > 1) {
            signedTransactions = await this._adapter.signAllTransactions(transactions);
        } else {
            signedTransactions = [];
        }

        return {
            signedTransactions: signedTransactions.map((transaction) =>
                transaction.serialize({ requireAllSignatures: false })
            ),
        };
    }

    private async _signMessage(input: SignMessageInput<this>): Promise<SignMessageOutput<this>> {
        if (input.extraSigners?.length) throw new Error('extraSigners not implemented');
        if (!('signMessage' in this._adapter)) throw new Error('signMessage not implemented by adapter');

        let signedMessages: Bytes[];
        if (input.messages.length === 1) {
            const signature = await this._adapter.signMessage(input.messages[0]);
            signedMessages = [concatBytes(input.messages[0], signature)];
        } else if (input.messages.length > 1) {
            throw new Error('signMessage for multiple messages not implemented');
        } else {
            signedMessages = [];
        }

        return { signedMessages };
    }
}

export class SolanaWalletAdapterWallet implements Wallet<SolanaWalletAdapterWalletAccount> {
    private _listeners: { [E in WalletEventNames]?: WalletEvents[E][] } = {};
    private _adapter: Adapter;
    private _chain: SolanaWalletAdapterChain;
    private _account: SolanaWalletAdapterWalletAccount | undefined;

    get version() {
        return '1.0.0';
    }

    get name() {
        return this._adapter.name;
    }

    get icon() {
        return this._adapter.icon;
    }

    get accounts() {
        return this._account ? [this._account] : [];
    }

    get chains() {
        return [this._chain];
    }

    get methods() {
        const methods: WalletAccountMethodNames<SolanaWalletAdapterWalletAccount>[] = ['signAndSendTransaction'];
        if ('signTransaction' in this._adapter) {
            methods.push('signTransaction');
        }
        if ('signMessage' in this._adapter) {
            methods.push('signMessage');
        }
        return methods;
    }

    get ciphers() {
        return [];
    }

    constructor(adapter: Adapter, chain: SolanaWalletAdapterChain) {
        this._adapter = adapter;
        this._chain = chain;

        adapter.on('connect', this._connect, this);
        adapter.on('disconnect', this._disconnect, this);

        this._connect();
    }

    destroy(): void {
        this._adapter.off('connect', this._connect, this);
        this._adapter.off('disconnect', this._disconnect, this);
    }

    async connect<
        Chain extends SolanaWalletAdapterWalletAccount['chain'],
        MethodNames extends WalletAccountMethodNames<SolanaWalletAdapterWalletAccount>,
        Input extends ConnectInput<SolanaWalletAdapterWalletAccount, Chain, MethodNames>
    >({
        chains,
        addresses,
        methods,
        silent,
    }: Input): Promise<ConnectOutput<SolanaWalletAdapterWalletAccount, Chain, MethodNames, Input>> {
        if (!silent && !this._adapter.connected) {
            await this._adapter.connect();
        }

        if (chains?.length) {
            this._chain = chains[0];
        }

        this._connect();

        return {
            accounts: this.accounts as any, // FIXME
            hasMoreAccounts: false,
        };
    }

    on<E extends WalletEventNames>(event: E, listener: WalletEvents[E]): () => void {
        this._listeners[event]?.push(listener) || (this._listeners[event] = [listener]);
        return (): void => this._off(event, listener);
    }

    private _emit<E extends WalletEventNames>(event: E): void {
        this._listeners[event]?.forEach((listener) => listener());
    }

    private _off<E extends WalletEventNames>(event: E, listener: WalletEvents[E]): void {
        this._listeners[event] = this._listeners[event]?.filter((existingListener) => listener !== existingListener);
    }

    private _connect(): void {
        const publicKey = this._adapter.publicKey?.toBytes();
        if (publicKey) {
            const account = this._account;
            if (!account || account.chain !== this._chain || !bytesEqual(account.publicKey, publicKey)) {
                this._account = new SolanaWalletAdapterWalletAccount(this._adapter, publicKey, this._chain);
                this._emit('accountsChanged');
            }
        }
    }

    private _disconnect(): void {
        if (this._account) {
            this._account = undefined;
            this._emit('accountsChanged');
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
