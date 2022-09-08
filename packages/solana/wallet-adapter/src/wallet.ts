import type { Adapter } from '@solana/wallet-adapter-base';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import { Transaction } from '@solana/web3.js';
import { initialize } from '@wallet-standard/app';
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
import { getEndpointForChain, sendAndConfirmTransaction } from '@wallet-standard/solana-web3.js';
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
import { bytesEqual } from '@wallet-standard/util';
import { decode } from 'bs58';

/** TODO: docs */
export class SolanaWalletAdapterWalletAccount implements WalletAccount {
    readonly #adapter: Adapter;
    readonly #publicKey: Uint8Array;
    readonly #chain: SolanaChain;
    readonly #endpoint: string | undefined;

    get address() {
        return this.publicKey;
    }

    get publicKey() {
        return this.#publicKey.slice();
    }

    get chain() {
        return this.#chain;
    }

    get features(): SolanaFeature & Partial<SignTransactionFeature & SignMessageFeature> {
        const solana: SolanaFeature = {
            solana: {
                version: '1.0.0',
                signAndSendTransaction: this.#signAndSendTransaction,
            },
        };

        let signTransactionFeature: SignTransactionFeature | undefined;
        if ('signTransaction' in this.#adapter) {
            signTransactionFeature = {
                signTransaction: {
                    version: '1.0.0',
                    signTransaction: this.#signTransaction,
                },
            };
        }

        let signMessageFeature: SignMessageFeature | undefined;
        if ('signMessage' in this.#adapter) {
            signMessageFeature = {
                signMessage: {
                    version: '1.0.0',
                    signMessage: this.#signMessage,
                },
            };
        }

        return { ...solana, ...signTransactionFeature, ...signMessageFeature };
    }

    get endpoint() {
        return this.#endpoint;
    }

    constructor(adapter: Adapter, publicKey: Uint8Array, chain: SolanaChain, endpoint?: string) {
        this.#adapter = adapter;
        this.#publicKey = publicKey;
        this.#chain = chain;
        this.#endpoint = endpoint;
    }

    #signAndSendTransaction: SolanaSignAndSendTransactionMethod = async (...inputs) => {
        const outputs: SolanaSignAndSendTransactionOutput[] = [];

        if (inputs.length === 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const input = inputs[0]!;
            const transaction = Transaction.from(input.transaction);
            const endpoint = getEndpointForChain(this.#chain, this.#endpoint);

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

        return outputs as any;
    };

    #signTransaction: SignTransactionMethod = async (...inputs) => {
        if (!('signTransaction' in this.#adapter)) throw new Error('signTransaction not implemented by adapter');
        const outputs: SignTransactionOutput[] = [];

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

        return outputs as any;
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

        return outputs as any;
    };
}

/** TODO: docs */
export class SolanaWalletAdapterWallet implements Wallet<SolanaWalletAdapterWalletAccount> {
    #listeners: {
        [E in WalletEventNames<SolanaWalletAdapterWalletAccount>]?: WalletEvents<SolanaWalletAdapterWalletAccount>[E][];
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
        return this.#adapter.icon;
    }

    get chains() {
        return [this.#chain];
    }

    get features() {
        const features: WalletAccountFeatureName<SolanaWalletAdapterWalletAccount>[] = ['solana'];
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

    get endpoint() {
        return this.#endpoint;
    }

    constructor(adapter: Adapter, chain: SolanaChain, endpoint?: string) {
        this.#adapter = adapter;
        this.#chain = chain;
        this.#endpoint = endpoint;

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
        FeatureName extends WalletAccountFeatureName<SolanaWalletAdapterWalletAccount>,
        ExtensionName extends WalletAccountExtensionName<SolanaWalletAdapterWalletAccount>,
        Input extends ConnectInput<SolanaWalletAdapterWalletAccount, Chain, FeatureName, ExtensionName>
    >(
        input?: Input
    ): Promise<ConnectOutput<SolanaWalletAdapterWalletAccount, Chain, FeatureName, ExtensionName, Input>> {
        const { chains, addresses, features, silent } = input || {};

        // FIXME: features

        if (!silent && !this.#adapter.connected) {
            await this.#adapter.connect();
        }

        if (chains?.length) {
            if (chains.length > 1) throw new Error('multiple chains not supported');
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.#chain = chains[0]!;
        }

        this.#connect();

        return { accounts: this.accounts as any }; // FIXME
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
            if (
                !account ||
                account.chain !== this.#chain ||
                account.endpoint !== this.#endpoint ||
                !bytesEqual(account.publicKey, publicKey)
            ) {
                this.#account = new SolanaWalletAdapterWalletAccount(
                    this.#adapter,
                    publicKey,
                    this.#chain,
                    this.#endpoint
                );
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

/** TODO: docs */
export function registerWalletAdapter(
    adapter: Adapter,
    chain: SolanaChain,
    endpoint?: string,
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
