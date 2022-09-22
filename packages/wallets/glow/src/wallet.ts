import type { TransactionSignature } from '@solana/web3.js';
import { Transaction } from '@solana/web3.js';
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
} from '@wallet-standard/features';
import { getEndpointForChain, sendAndConfirmTransaction } from '@wallet-standard/solana-web3.js';
import type { IdentifierArray, Wallet, WalletAccount, WalletEventNames, WalletEvents } from '@wallet-standard/standard';
import type { CHAIN_SOLANA_TESTNET, SolanaChain } from '@wallet-standard/util';
import { bytesEqual, CHAIN_SOLANA_DEVNET, CHAIN_SOLANA_LOCALNET, CHAIN_SOLANA_MAINNET } from '@wallet-standard/util';
import { decode } from 'bs58';
import { Buffer } from 'buffer';
import type { SolanaWindow } from './glow.js';
import { Network } from './glow.js';
import { icon } from './icon.js';

declare const window: SolanaWindow;

export class GlowSolanaWallet implements Wallet {
    readonly #listeners: { [E in WalletEventNames]?: WalletEvents[E][] } = {};
    readonly #version = '1.0.0' as const;
    readonly #name = 'Glow' as const;
    readonly #icon = icon;
    readonly #chains = [CHAIN_SOLANA_MAINNET, CHAIN_SOLANA_DEVNET, CHAIN_SOLANA_LOCALNET] as const;
    #account: GlowSolanaWalletAccount | null;

    get version() {
        return this.#version;
    }

    get name() {
        return this.#name;
    }

    get icon() {
        return this.#icon;
    }

    get chains(): ReadonlyArray<SupportedChain> {
        return this.#chains.slice();
    }

    get features(): ConnectFeature &
        SolanaSignAndSendTransactionFeature &
        SolanaSignTransactionFeature &
        SignMessageFeature {
        return {
            'standard:connect': {
                version: '1.0.0',
                connect: this.#connect,
            },
            'standard:solanaSignAndSendTransaction': {
                version: '1.0.0',
                solanaSignAndSendTransaction: this.#signAndSendTransaction,
            },
            'standard:solanaSignTransaction': {
                version: '1.0.0',
                solanaSignTransaction: this.#signTransaction,
            },
            'standard:signMessage': {
                version: '1.0.0',
                signMessage: this.#signMessage,
            },
        };
    }

    get accounts() {
        return this.#account ? [this.#account] : [];
    }

    constructor() {
        this.#account = null;

        window.glow.on('connect', this.#connected, this);
        window.glow.on('disconnect', this.#disconnected, this);
        window.glow.on('accountChanged', this.#reconnected, this);

        this.#connected();
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

    #connected = () => {
        const address = window.glowSolana.publicKey?.toBase58();
        if (address) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const publicKey = window.glowSolana.publicKey!.toBytes();

            const account = this.#account;
            if (!account || account.address !== address || !bytesEqual(account.publicKey, publicKey)) {
                this.#account = new GlowSolanaWalletAccount(address, publicKey, this.#chains, [
                    'standard:solanaSignAndSendTransaction',
                    'standard:solanaSignTransaction',
                    'standard:signMessage',
                ]);
                this.#emit('standard:change', ['accounts']);
            }
        }
    };

    #disconnected = () => {
        if (this.#account) {
            this.#account = null;
            this.#emit('standard:change', ['accounts']);
        }
    };

    #reconnected = () => {
        if (window.glowSolana.publicKey) {
            this.#connected();
        } else {
            this.#disconnected();
        }
    };

    #connect: ConnectMethod = async ({ silent } = {}) => {
        await window.glow.connect(silent ? { onlyIfTrusted: true } : undefined);

        this.#connected();

        return { accounts: this.accounts };
    };

    #signAndSendTransaction: SolanaSignAndSendTransactionMethod = async (...inputs) => {
        if (!this.#account) throw new Error('not connected');

        const outputs: SolanaSignAndSendTransactionOutput[] = [];

        if (inputs.length === 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const { transaction, account, chain, options } = inputs[0]!;
            const { commitment } = options || {};
            if (account !== this.#account) throw new Error('invalid account');
            if (!this.#chains.includes(chain as SupportedChain)) throw new Error('invalid chain');

            const glowSignAndSendTransaction = async () => {
                const { signature } = await window.glow.signAndSendTransaction({
                    transactionBase64: Buffer.from(transaction).toString('base64'),
                    network: getNetworkForChain(chain as SupportedChain),
                    waitForConfirmation: options === 'confirmed',
                });

                return signature;
            };

            let signature: TransactionSignature;
            if (commitment === 'confirmed') {
                signature = await glowSignAndSendTransaction();
            } else {
                signature = await sendAndConfirmTransaction(
                    Transaction.from(transaction),
                    getEndpointForChain(chain as SupportedChain),
                    options,
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

    #signTransaction: SolanaSignTransactionMethod = async (...inputs) => {
        if (!this.#account) throw new Error('not connected');

        const outputs: SolanaSignTransactionOutput[] = [];

        if (inputs.length === 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const { transaction, account, chain } = inputs[0]!;
            if (account !== this.#account) throw new Error('invalid account');
            if (chain && !this.#chains.includes(chain as SupportedChain)) throw new Error('invalid chain');

            const signedTransaction = await window.glowSolana.signTransaction(
                Transaction.from(transaction),
                chain && getNetworkForChain(chain as SupportedChain)
            );

            outputs.push({
                signedTransaction: signedTransaction.serialize({
                    requireAllSignatures: false,
                    verifySignatures: false,
                }),
            });
        } else if (inputs.length > 1) {
            let chain: SupportedChain | undefined = undefined;
            for (const input of inputs) {
                if (input.account !== this.#account) throw new Error('invalid account');
                if (input.chain) {
                    if (!this.chains.includes(input.chain as SupportedChain)) throw new Error('invalid chain');
                    if (chain) {
                        if (input.chain !== chain) throw new Error('conflicting chain');
                    } else {
                        chain = input.chain as SupportedChain;
                    }
                }
            }

            const transactions = inputs.map(({ transaction }) => Transaction.from(transaction));

            const signedTransactions = await window.glowSolana.signAllTransactions(
                transactions,
                chain && getNetworkForChain(chain)
            );

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
        if (!this.#account) throw new Error('not connected');

        const outputs: SignMessageOutput[] = [];

        if (inputs.length === 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const { message, account } = inputs[0]!;
            if (account !== this.#account) throw new Error('invalid account');

            const { signedMessageBase64 } = await window.glow.signMessage({
                messageBase64: Buffer.from(message).toString('base64'),
            });

            const signature = new Uint8Array(Buffer.from(signedMessageBase64, 'base64'));

            outputs.push({ signedMessage: message, signature });
        } else if (inputs.length > 1) {
            for (const input of inputs) {
                outputs.push(...(await this.#signMessage(input)));
            }
        }

        return outputs as any;
    };
}

export class GlowSolanaWalletAccount implements WalletAccount {
    readonly #address: string;
    readonly #publicKey: Uint8Array;
    readonly #chains: ReadonlyArray<SupportedChain>;
    readonly #features: IdentifierArray;

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
        return this.#features.slice();
    }

    constructor(
        address: string,
        publicKey: Uint8Array,
        chains: ReadonlyArray<SupportedChain>,
        features: IdentifierArray
    ) {
        this.#address = address;
        this.#publicKey = publicKey;
        this.#chains = chains;
        this.#features = features;
    }
}

type SupportedChain = Exclude<SolanaChain, typeof CHAIN_SOLANA_TESTNET>;

function getNetworkForChain(chain: SupportedChain): Network {
    switch (chain) {
        case CHAIN_SOLANA_MAINNET:
            return Network.Mainnet;
        case CHAIN_SOLANA_DEVNET:
            return Network.Devnet;
        case CHAIN_SOLANA_LOCALNET:
            return Network.Localnet;
        default:
            return Network.Mainnet;
    }
}
