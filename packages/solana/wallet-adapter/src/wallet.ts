import type { Adapter } from '@solana/wallet-adapter-base';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import { Transaction } from '@solana/web3.js';
import { initialize } from '@wallet-standard/app';
import type {
    ConnectFeature,
    ConnectMethod,
    SignMessageFeature,
    SignMessageMethod,
    SignMessageOutput,
    SolanaSignAndSendTransactionFeature,
    SolanaSignAndSendTransactionMethod,
    SolanaSignAndSendTransactionOutput,
    SolanaSignTransactionFeature,
    SolanaSignTransactionMethod,
    SolanaSignTransactionOutput,
    WalletWithStandardFeatures,
} from '@wallet-standard/features';
import { getEndpointForChain, sendAndConfirmTransaction } from '@wallet-standard/solana-web3.js';
import type { IconString, Wallet, WalletAccount, WalletEventNames, WalletEvents } from '@wallet-standard/standard';
import type { SolanaChain } from '@wallet-standard/util';
import { bytesEqual } from '@wallet-standard/util';
import { decode } from 'bs58';

/** TODO: docs */
export class SolanaWalletAdapterWalletAccount implements WalletAccount {
    readonly #adapter: Adapter;
    readonly #address: string;
    readonly #publicKey: Uint8Array;
    readonly #chains: ReadonlyArray<SolanaChain>;

    get address() {
        return this.#address;
    }

    get publicKey() {
        return this.#publicKey.slice();
    }

    get chains() {
        return this.#chains.slice();
    }

    get features() {
        const features: (keyof (ConnectFeature &
            SolanaSignAndSendTransactionFeature &
            SolanaSignTransactionFeature &
            SignMessageFeature))[] = ['standard:connect', 'solana:signAndSendTransaction'];
        if ('signTransaction' in this.#adapter) {
            features.push('solana:signTransaction');
        }
        if ('signMessage' in this.#adapter) {
            features.push('standard:signMessage');
        }
        return features;
    }

    constructor(adapter: Adapter, address: string, publicKey: Uint8Array, chains: SolanaChain[]) {
        this.#adapter = adapter;
        this.#address = address;
        this.#publicKey = publicKey;
        this.#chains = chains;
    }
}

/** TODO: docs */
export class SolanaWalletAdapterWallet implements WalletWithStandardFeatures {
    #listeners: {
        [E in WalletEventNames]?: WalletEvents[E][];
    } = {};
    #adapter: Adapter;
    #chain: SolanaChain;
    #endpoint: string | undefined;
    #account: SolanaWalletAdapterWalletAccount | undefined;

    get version() {
        return '1.0.0' as const;
    }

    get name() {
        return this.#adapter.name;
    }

    get icon() {
        return this.#adapter.icon as IconString;
    }

    get chains() {
        return [this.#chain];
    }

    get features(): ConnectFeature &
        SolanaSignAndSendTransactionFeature &
        Partial<SolanaSignTransactionFeature & SignMessageFeature> {
        const features: ConnectFeature & SolanaSignAndSendTransactionFeature = {
            'standard:connect': {
                version: '1.0.0',
                connect: this.#connect,
            },
            'solana:signAndSendTransaction': {
                version: '1.0.0',
                signAndSendTransaction: this.#signAndSendTransaction,
            },
        };

        let signTransactionFeature: SolanaSignTransactionFeature | undefined;
        if ('signTransaction' in this.#adapter) {
            signTransactionFeature = {
                'solana:signTransaction': {
                    version: '1.0.0',
                    signTransaction: this.#signTransaction,
                },
            };
        }

        let signMessageFeature: SignMessageFeature | undefined;
        if ('signMessage' in this.#adapter) {
            signMessageFeature = {
                'standard:signMessage': {
                    version: '1.0.0',
                    signMessage: this.#signMessage,
                },
            };
        }

        return { ...features, ...signTransactionFeature, ...signMessageFeature };
    }

    get accounts() {
        return this.#account ? [this.#account] : [];
    }

    get endpoint() {
        return this.#endpoint;
    }

    constructor(adapter: Adapter, chain: SolanaChain, endpoint?: string) {
        this.#adapter = adapter;
        this.#chain = chain;
        this.#endpoint = endpoint;

        adapter.on('connect', this.#connected, this);
        adapter.on('disconnect', this.#disconnected, this);

        this.#connected();
    }

    destroy(): void {
        this.#adapter.off('connect', this.#connected, this);
        this.#adapter.off('disconnect', this.#disconnected, this);
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

    #connected(): void {
        const publicKey = this.#adapter.publicKey?.toBytes();
        if (publicKey) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const address = this.#adapter.publicKey!.toBase58();
            const account = this.#account;
            if (
                !account ||
                account.address !== address ||
                account.chains.includes(this.#chain) ||
                !bytesEqual(account.publicKey, publicKey)
            ) {
                this.#account = new SolanaWalletAdapterWalletAccount(this.#adapter, address, publicKey, [this.#chain]);
                this.#emit('standard:change', ['accounts']);
            }
        }
    }

    #disconnected(): void {
        if (this.#account) {
            this.#account = undefined;
            this.#emit('standard:change', ['accounts']);
        }
    }

    #connect: ConnectMethod = async ({ silent } = {}) => {
        if (!silent && !this.#adapter.connected) {
            await this.#adapter.connect();
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
            // FIXME: input.chain may not be a SolanaChain
            const endpoint = getEndpointForChain(input.chain as SolanaChain, this.#endpoint);

            const signature = await sendAndConfirmTransaction(
                transaction,
                endpoint,
                input.options,
                async (transaction, connection, options) =>
                    await this.#adapter.sendTransaction(transaction, connection, options)
            );

            outputs.push({ signature: decode(signature) });
        } else if (inputs.length > 1) {
            // Adapters have no `sendAllTransactions` method, so just sign and send each transaction in serial.
            for (const input of inputs) {
                outputs.push(...(await this.#signAndSendTransaction(input)));
            }
        }

        return outputs;
    };

    #signTransaction: SolanaSignTransactionMethod = async (...inputs) => {
        if (!('signTransaction' in this.#adapter)) throw new Error('signTransaction not implemented by adapter');
        const outputs: SolanaSignTransactionOutput[] = [];

        if (inputs.length === 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const transaction = Transaction.from(inputs[0]!.transaction);
            const signedTransaction = await this.#adapter.signTransaction(transaction);

            outputs.push({
                signedTransaction: signedTransaction.serialize({
                    requireAllSignatures: false,
                    verifySignatures: false,
                }),
            });
        } else if (inputs.length > 1) {
            const transactions = inputs.map(({ transaction }) => Transaction.from(transaction));
            const signedTransactions = await this.#adapter.signAllTransactions(transactions);

            outputs.push(
                ...signedTransactions.map((signedTransaction) => ({
                    signedTransaction: signedTransaction.serialize({
                        requireAllSignatures: false,
                        verifySignatures: false,
                    }),
                }))
            );
        }

        return outputs;
    };

    #signMessage: SignMessageMethod = async (...inputs) => {
        if (!('signMessage' in this.#adapter)) throw new Error('signMessage not implemented by adapter');
        const outputs: SignMessageOutput[] = [];

        if (inputs.length === 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const signedMessage = inputs[0]!.message;
            const signature = await this.#adapter.signMessage(signedMessage);

            outputs.push({ signedMessage, signature });
        } else if (inputs.length > 1) {
            throw new Error('signMessage for multiple messages not implemented');
        }

        return outputs;
    };
}

/** TODO: docs */
export function registerWalletAdapter(
    adapter: Adapter,
    chain: SolanaChain,
    endpoint?: string,
    match: (wallet: Wallet) => boolean = (wallet) => wallet.name === adapter.name
): () => void {
    const wallets = initialize();
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
            const wallet = new SolanaWalletAdapterWallet(adapter, chain, endpoint);
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
