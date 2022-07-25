import {
    MessageSignerWalletAdapter,
    SignerWalletAdapter,
    WalletAdapter,
    WalletReadyState,
} from '@solana/wallet-adapter-base';
import {
    Bytes,
    CHAIN_SOLANA_DEVNET,
    CHAIN_SOLANA_MAINNET,
    CHAIN_SOLANA_TESTNET,
    ConnectInput,
    ConnectOutput,
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
    WalletsWindow,
} from '@solana/wallet-standard';
import { Cluster, clusterApiUrl, Connection, Transaction, TransactionSignature } from '@solana/web3.js';
import { decode } from 'bs58';

export type SolanaWalletAdapterChain = typeof CHAIN_SOLANA_MAINNET | typeof CHAIN_SOLANA_DEVNET | typeof CHAIN_SOLANA_TESTNET;

export class SolanaWalletAdapterWalletAccount implements WalletAccount {
    private _adapter: WalletAdapter | SignerWalletAdapter | MessageSignerWalletAdapter;
    private _publicKey: Bytes;
    private _chain: SolanaWalletAdapterChain;

    get address() {
        return new Uint8Array(this._publicKey);
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

    get methods(): SignTransactionMethod | SignAndSendTransactionMethod | SignMessageMethod {
        const methods: SignAndSendTransactionMethod & Partial<SignTransactionMethod & SignMessageMethod> = {
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

    constructor(adapter: WalletAdapter, publicKey: Bytes, chain: SolanaWalletAdapterChain) {
        this._adapter = adapter;
        this._publicKey = publicKey;
        this._chain = chain;
    }

    private async _signAndSendTransaction(input: SignAndSendTransactionInput): Promise<SignAndSendTransactionOutput> {
        const transactions = input.transactions.map((rawTransaction) => Transaction.from(rawTransaction));

        let signatures: TransactionSignature[];
        if (transactions.length === 1) {
            let cluster: Cluster;
            if (this._chain === CHAIN_SOLANA_MAINNET) {
                cluster = 'mainnet-beta';
            } else if (this._chain === CHAIN_SOLANA_DEVNET) {
                cluster = 'devnet';
            } else if (this._chain === CHAIN_SOLANA_TESTNET) {
                cluster = 'testnet';
            } else {
                throw new Error(); // FIXME
            }

            signatures = [await this._adapter.sendTransaction(transactions[0], new Connection(clusterApiUrl(cluster)))];
        } else if (transactions.length > 1) {
            throw new Error(); // FIXME
        } else {
            signatures = [];
        }

        return { signatures: signatures.map((signature) => decode(signature)) };
    }

    private async _signTransaction(input: SignTransactionInput): Promise<SignTransactionOutput> {
        if (!('signTransaction' in this._adapter)) throw new Error(); // FIXME

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

    private async _signMessage(input: SignMessageInput): Promise<SignMessageOutput> {
        if (!('signMessage' in this._adapter)) throw new Error(); // FIXME

        let signatures: Bytes[];
        if (input.messages.length === 1) {
            signatures = [await this._adapter.signMessage(input.messages[0])]; // FIXME
        } else if (input.messages.length > 1) {
            throw new Error(); // FIXME
        } else {
            signatures = [];
        }

        return { signatures };
    }
}

export class SolanaWalletAdapterWallet implements Wallet<SolanaWalletAdapterWalletAccount> {
    private _listeners: { [E in WalletEventNames]?: WalletEvents[E][] } = {};
    private _account: SolanaWalletAdapterWalletAccount | undefined;
    private _adapter: WalletAdapter | SignerWalletAdapter | MessageSignerWalletAdapter;

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

    get chains(): SolanaWalletAdapterChain[] {
        return ['solana:mainnet', 'solana:devnet', 'solana:testnet'];
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

    constructor(adapter: WalletAdapter) {
        this._adapter = adapter;
        adapter.on('disconnect', this._disconnect);
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
        if (chains.length !== 1) throw new Error(); // FIXME

        const adapter = this._adapter;

        if (this._account) {
            this._account = undefined;
            await adapter.disconnect();
        }

        await adapter.connect();

        const publicKey = adapter.publicKey;
        if (!publicKey) throw new Error(); // FIXME

        this._account = new SolanaWalletAdapterWalletAccount(adapter, publicKey.toBytes(), chains[0]); // FIXME

        return {
            accounts: [this._account as any], // FIXME
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
        this._listeners[event] = this._listeners[event]?.filter((l) => listener !== l);
    }

    private _disconnect(): void {
        if (this._account) {
            this._account = undefined;
            this._emit('accountsChanged'); // FIXME
        }
    }
}

declare const window: WalletsWindow<SolanaWalletAdapterWalletAccount>;

export function registerWalletAdapter(adapter: WalletAdapter) {
    function register(readyState: WalletReadyState) {
        if (readyState === WalletReadyState.Installed) {
            adapter.off('readyStateChange', register);

            window.wallets = window.wallets || [];
            window.wallets.push({ method: 'register', wallets: [new SolanaWalletAdapterWallet(adapter)] });
        }
    }

    adapter.on('readyStateChange', register);
    register(adapter.readyState);
}
