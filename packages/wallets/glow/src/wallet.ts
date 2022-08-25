import type { SolanaWindow } from '@glow-xyz/glow-client';
import { Network } from '@glow-xyz/glow-client';
import type { PublicKey, TransactionSignature } from '@solana/web3.js';
import { Transaction } from '@solana/web3.js';
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
import { bytesEqual, CHAIN_SOLANA_MAINNET } from '@wallet-standard/util';
import { CHAIN_SOLANA_DEVNET, CHAIN_SOLANA_LOCALNET } from '@wallet-standard/util/src';
import { decode } from 'bs58';
import { Buffer } from 'buffer';
import { icon } from './icon';

declare const window: SolanaWindow;

function getNetworkForChain(chain: SolanaChain): Network {
    switch (chain) {
        case CHAIN_SOLANA_MAINNET:
            return Network.Mainnet;
        case CHAIN_SOLANA_DEVNET:
            return Network.Devnet;
        case CHAIN_SOLANA_LOCALNET:
            return Network.Localnet;
        // TODO: testnet?
        default:
            return Network.Mainnet;
    }
}

export class GlowSolanaWalletAccount implements WalletAccount {
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
            const transactionBase64 = Buffer.from(input.transaction).toString('base64');
            const { commitment } = input.options || {};

            const glowSignAndSendTransaction = async () => {
                const { signature } = await window.glow.signAndSendTransaction({
                    transactionBase64,
                    network: getNetworkForChain(this.#chain),
                    waitForConfirmation: commitment === 'confirmed',
                });

                return signature;
            };

            let signature: TransactionSignature;
            if (commitment === 'confirmed') {
                signature = await glowSignAndSendTransaction();
            } else {
                const transaction = Transaction.from(input.transaction);
                const endpoint = getEndpointForChain(this.#chain);

                signature = await sendAndConfirmTransaction(
                    transaction,
                    endpoint,
                    input.options,
                    glowSignAndSendTransaction
                );
            }

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
            const transactionBase64 = Buffer.from(inputs[0]!.transaction).toString('base64');
            const { signedTransactionBase64 } = await window.glow.signTransaction({
                transactionBase64,
                network: getNetworkForChain(this.#chain),
            });

            outputs.push({
                signedTransaction: new Uint8Array(Buffer.from(signedTransactionBase64, 'base64')),
            });
        } else if (inputs.length > 1) {
            const transactionsBase64 = inputs.map(({ transaction }) => Buffer.from(transaction).toString('base64'));
            const { signedTransactionsBase64 } = await window.glow.signAllTransactions({
                transactionsBase64,
                network: getNetworkForChain(this.#chain),
            });

            outputs.push(
                ...signedTransactionsBase64.map((signedTransactionBase64) => ({
                    signedTransaction: new Uint8Array(Buffer.from(signedTransactionBase64, 'base64')),
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
            const messageBase64 = Buffer.from(signedMessage).toString('base64');
            const { signedMessageBase64 } = await window.glow.signMessage({ messageBase64 });

            const signature = new Uint8Array(Buffer.from(signedMessageBase64, 'base64'));

            outputs.push({ signedMessage, signature });
        } else if (inputs.length > 1) {
            for (const input of inputs) {
                outputs.push(...(await this.#signMessage(input)));
            }
        }

        return outputs as any;
    };
}

export class GlowSolanaWallet implements Wallet<GlowSolanaWalletAccount> {
    #listeners: {
        [E in WalletEventNames<GlowSolanaWalletAccount>]?: WalletEvents<GlowSolanaWalletAccount>[E][];
    } = {};
    #account: GlowSolanaWalletAccount | undefined;

    get version() {
        return '1.0.0' as const;
    }

    get name() {
        return 'Glow';
    }

    get icon() {
        return icon;
    }

    get chains() {
        return [CHAIN_SOLANA_MAINNET, CHAIN_SOLANA_DEVNET, CHAIN_SOLANA_LOCALNET] as const;
    }

    get features() {
        return ['solana' as const, 'signTransaction' as const, 'signMessage' as const];
    }

    get extensions() {
        return [] as const;
    }

    get accounts() {
        // TODO:
        return this.#account ? [this.#account] : [];
    }

    get hasMoreAccounts() {
        return false;
    }

    constructor() {
        window.glow.on('connect', this._connect, this);
        window.glow.on('disconnect', this._disconnect, this);
        window.glow.on('accountChanged', this._reconnect, this);

        this._connect();
    }

    async connect<
        Chain extends GlowSolanaWalletAccount['chain'],
        FeatureName extends WalletAccountFeatureName<GlowSolanaWalletAccount>,
        ExtensionName extends WalletAccountExtensionName<GlowSolanaWalletAccount>,
        Input extends ConnectInput<GlowSolanaWalletAccount, Chain, FeatureName, ExtensionName>
    >(input?: Input): Promise<ConnectOutput<GlowSolanaWalletAccount, Chain, FeatureName, ExtensionName, Input>> {
        // TODO: determine if any of these need to be used
        const { chains, features, extensions, addresses, silent } = input || {};

        // FIXME: chain used to connect

        await window.glow.connect(silent ? { onlyIfTrusted: true } : undefined);

        this._connect();

        return {
            accounts: this.accounts as any,
            hasMoreAccounts: false,
        };
    }

    on<E extends WalletEventNames<GlowSolanaWalletAccount>>(
        event: E,
        listener: WalletEvents<GlowSolanaWalletAccount>[E]
    ): () => void {
        this.#listeners[event]?.push(listener) || (this.#listeners[event] = [listener]);
        return (): void => this.#off(event, listener);
    }

    #emit<E extends WalletEventNames<GlowSolanaWalletAccount>>(
        event: E,
        ...args: Parameters<WalletEvents<GlowSolanaWalletAccount>[E]>
    ): void {
        // eslint-disable-next-line prefer-spread
        this.#listeners[event]?.forEach((listener) => listener.apply(null, args));
    }

    #off<E extends WalletEventNames<GlowSolanaWalletAccount>>(
        event: E,
        listener: WalletEvents<GlowSolanaWalletAccount>[E]
    ): void {
        this.#listeners[event] = this.#listeners[event]?.filter((existingListener) => listener !== existingListener);
    }

    private _connect(publicKey: PublicKey): void {
        const bytes = publicKey.toBytes();
        const account = this.#account;
        if (!account || !bytesEqual(account.publicKey, bytes)) {
            this.#account = new GlowSolanaWalletAccount(bytes, this.#chain); // FIXME: #chain doesn't exist on this
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
        if (window.glow.publicKey) {
            this._connect();
        } else {
            this._disconnect();
        }
    }
}
