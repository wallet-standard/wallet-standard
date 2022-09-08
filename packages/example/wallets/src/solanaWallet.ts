import type { Signer } from '@solana/web3.js';
import { Keypair, PublicKey, Transaction } from '@solana/web3.js';
import type {
    DecryptFeature,
    DecryptMethod,
    DecryptOutput,
    EncryptFeature,
    EncryptMethod,
    EncryptOutput,
    SignMessageFeature,
    SignMessageMethod,
    SignMessageOutput,
    SignTransactionFeature,
    SignTransactionMethod,
    SignTransactionOutput,
    SolanaSignAndSendTransactionFeature,
    SolanaSignAndSendTransactionMethod,
    SolanaSignAndSendTransactionOutput,
} from '@wallet-standard/features';
import { getEndpointForChain, sendAndConfirmTransaction } from '@wallet-standard/solana-web3.js';
import type { Wallet, WalletAccount } from '@wallet-standard/standard';
import type { UnionToIntersection } from '@wallet-standard/types';
import type { CHAIN_SOLANA_DEVNET, CHAIN_SOLANA_LOCALNET, CHAIN_SOLANA_TESTNET } from '@wallet-standard/util';
import { CHAIN_SOLANA_MAINNET, CIPHER_x25519_xsalsa20_poly1305, pick } from '@wallet-standard/util';
import { decode } from 'bs58';
import { box, randomBytes, sign } from 'tweetnacl';
import { AbstractWallet } from './abstractWallet.js';

export class SolanaWallet extends AbstractWallet implements Wallet {
    #name = 'Solana Wallet';
    #icon =
        'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9Ijg4IiB2aWV3Qm94PSIwIDAgMTAxIDg4IiB3aWR0aD0iMTAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48bGluZWFyR3JhZGllbnQgaWQ9ImEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iOC41MjU1OCIgeDI9Ijg4Ljk5MzMiIHkxPSI5MC4wOTczIiB5Mj0iLTMuMDE2MjIiPjxzdG9wIG9mZnNldD0iLjA4IiBzdG9wLWNvbG9yPSIjOTk0NWZmIi8+PHN0b3Agb2Zmc2V0PSIuMyIgc3RvcC1jb2xvcj0iIzg3NTJmMyIvPjxzdG9wIG9mZnNldD0iLjUiIHN0b3AtY29sb3I9IiM1NDk3ZDUiLz48c3RvcCBvZmZzZXQ9Ii42IiBzdG9wLWNvbG9yPSIjNDNiNGNhIi8+PHN0b3Agb2Zmc2V0PSIuNzIiIHN0b3AtY29sb3I9IiMyOGUwYjkiLz48c3RvcCBvZmZzZXQ9Ii45NyIgc3RvcC1jb2xvcj0iIzE5ZmI5YiIvPjwvbGluZWFyR3JhZGllbnQ+PHBhdGggZD0ibTEwMC40OCA2OS4zODE3LTE2LjY3MzIgMTcuNDE5OGMtLjM2MjQuMzc4NC0uODAxLjY4MDEtMS4yODgzLjg4NjNzLTEuMDEzLjMxMjUtMS41NDQyLjMxMjJoLTc5LjAzODY3Yy0uMzc3MTQgMC0uNzQ2MDYtLjEwNzQtMS4wNjE0MjgtLjMwODgtLjMxNTM3My0uMjAxNS0uNTYzNDYyLS40ODgzLS43MTM3ODYtLjgyNTMtLjE1MDMyMzctLjMzNjktLjE5NjMzNDEtLjcwOTMtLjEzMjM3NzgtMS4wNzE0LjA2Mzk1NjItLjM2MjEuMjM1MDkyOC0uNjk4MS40OTIzODM4LS45NjY3bDE2LjY4NTY3OC0xNy40MTk4Yy4zNjE1LS4zNzc0Ljc5ODYtLjY3ODUgMS4yODQzLS44ODQ2LjQ4NTgtLjIwNjIgMS4wMDk4LS4zMTMgMS41Mzk3LS4zMTM5aDc5LjAzNDNjLjM3NzEgMCAuNzQ2LjEwNzQgMS4wNjE2LjMwODguMzE1LjIwMTUuNTYzLjQ4ODQuNzE0LjgyNTMuMTUuMzM3LjE5Ni43MDkzLjEzMiAxLjA3MTRzLS4yMzUuNjk4MS0uNDkyLjk2Njd6bS0xNi42NzMyLTM1LjA3ODVjLS4zNjI0LS4zNzg0LS44MDEtLjY4MDEtMS4yODgzLS44ODYzLS40ODczLS4yMDYxLTEuMDEzLS4zMTI0LTEuNTQ0Mi0uMzEyMWgtNzkuMDM4NjdjLS4zNzcxNCAwLS43NDYwNi4xMDczLTEuMDYxNDI4LjMwODgtLjMxNTM3My4yMDE1LS41NjM0NjIuNDg4My0uNzEzNzg2LjgyNTItLjE1MDMyMzcuMzM3LS4xOTYzMzQxLjcwOTQtLjEzMjM3NzggMS4wNzE1LjA2Mzk1NjIuMzYyLjIzNTA5MjguNjk4LjQ5MjM4MzguOTY2N2wxNi42ODU2NzggMTcuNDE5OGMuMzYxNS4zNzc0Ljc5ODYuNjc4NCAxLjI4NDMuODg0Ni40ODU4LjIwNjEgMS4wMDk4LjMxMyAxLjUzOTcuMzEzOGg3OS4wMzQzYy4zNzcxIDAgLjc0Ni0uMTA3MyAxLjA2MTYtLjMwODguMzE1LS4yMDE1LjU2My0uNDg4My43MTQtLjgyNTIuMTUtLjMzNy4xOTYtLjcwOTQuMTMyLTEuMDcxNS0uMDY0LS4zNjItLjIzNS0uNjk4LS40OTItLjk2Njd6bS04MS44NzExNy0xMi41MTI3aDc5LjAzODY3Yy41MzEyLjAwMDIgMS4wNTY5LS4xMDYgMS41NDQyLS4zMTIycy45MjU5LS41MDc5IDEuMjg4My0uODg2M2wxNi42NzMyLTE3LjQxOTgxYy4yNTctLjI2ODYyLjQyOC0uNjA0NjEuNDkyLS45NjY2OXMuMDE4LS43MzQ0Ny0uMTMyLTEuMDcxNDJjLS4xNTEtLjMzNjk1LS4zOTktLjYyMzc4NC0uNzE0LS44MjUyNTctLjMxNTYtLjIwMTQ3NC0uNjg0NS0uMzA4ODEwNTktMS4wNjE2LS4zMDg4MjNoLTc5LjAzNDNjLS41Mjk5LjAwMDg3ODQtMS4wNTM5LjEwNzY5OS0xLjUzOTcuMzEzODQ4LS40ODU3LjIwNjE1LS45MjI4LjUwNzIzOS0xLjI4NDMuODg0NjMybC0xNi42ODEzNzcgMTcuNDE5ODJjLS4yNTcwNDIuMjY4My0uNDI4MTAzMi42MDQtLjQ5MjIwNDUuOTY1Ni0uMDY0MTAxNC4zNjE3LS4wMTg0NTYxLjczMzguMTMxMzM3NSAxLjA3MDYuMTQ5Nzk0LjMzNjguMzk3MjI1LjYyMzYuNzExOTQ4LjgyNTQuMzE0NzI2LjIwMTguNjgzMDU2LjMwOTcgMS4wNTk4MjYuMzEwNnoiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=';

    get name() {
        return this.#name;
    }

    get icon() {
        return this.#icon;
    }

    constructor() {
        super([
            new SignerSolanaWalletAccount({ chain: CHAIN_SOLANA_MAINNET }),
            new LedgerSolanaWalletAccount({ chain: CHAIN_SOLANA_MAINNET }),
        ]);
    }
}

export type SolanaWalletAccount = SignerSolanaWalletAccount | LedgerSolanaWalletAccount;

export type SolanaWalletChain =
    | typeof CHAIN_SOLANA_MAINNET
    | typeof CHAIN_SOLANA_DEVNET
    | typeof CHAIN_SOLANA_TESTNET
    | typeof CHAIN_SOLANA_LOCALNET;

export type SolanaWalletAccountFeature =
    | SolanaSignAndSendTransactionFeature
    | SignTransactionFeature
    | SignMessageFeature
    | EncryptFeature
    | DecryptFeature;

export class SignerSolanaWalletAccount implements WalletAccount {
    #address: string;
    #publicKey: Uint8Array;
    #chains: ReadonlyArray<SolanaWalletChain>;
    #features: SolanaWalletAccountFeature;
    #endpoint: string;
    #signer: Signer;

    get address() {
        return this.#address;
    }

    get publicKey() {
        return this.#publicKey.slice();
    }

    get chain() {
        return this.#chains.slice();
    }

    get features() {
        return { ...this.#features };
    }

    constructor({
        chain,
        features,
    }: {
        chain: SolanaWalletChain;
        features?: ReadonlyArray<keyof UnionToIntersection<SolanaWalletAccountFeature>>;
    }) {
        this.#chain = chain;
        this.#features = features ? pick(this.#allFeatures, ...features) : this.#allFeatures;
        this.#endpoint = getEndpointForChain(chain);
        this.#signer = Keypair.generate();
        this.#publicKey = this.#signer.publicKey.toBytes();
    }

    #signAndSendTransaction: SolanaSignAndSendTransactionMethod = async (...inputs) => {
        if (!('solana' in this.#features)) throw new Error('signAndSendTransaction not authorized');

        const outputs: SolanaSignAndSendTransactionOutput[] = [];
        for (const input of inputs) {
            const transaction = Transaction.from(input.transaction);

            // Prompt the user with transaction to sign and send

            transaction.partialSign(this.#signer);

            const signature = await sendAndConfirmTransaction(transaction, this.#endpoint, input.options);

            outputs.push({ signature: decode(signature) });
        }

        return outputs as any;
    };

    #signTransaction: SignTransactionMethod = async (...inputs) => {
        if (!('signTransaction' in this.#features)) throw new Error('signTransaction not authorized');

        const transactions = inputs.map(({ transaction }) => Transaction.from(transaction));

        // Prompt the user with transactions to sign

        const outputs: SignTransactionOutput[] = [];
        for (const transaction of transactions) {
            transaction.partialSign(this.#signer);
            outputs.push({ signedTransaction: transaction.serialize({ requireAllSignatures: false }) });
        }

        return outputs as any;
    };

    #signMessage: SignMessageMethod = async (...inputs) => {
        if (!('signMessage' in this.#features)) throw new Error('signMessage not authorized');

        // Prompt the user with messages to sign

        const outputs: SignMessageOutput[] = [];
        for (const { message } of inputs) {
            // TODO: prefix according to https://github.com/solana-labs/solana/pull/26915
            outputs.push({
                signedMessage: message,
                signature: sign.detached(message, this.#signer.secretKey),
            });
        }

        return outputs as any;
    };

    #encrypt: EncryptMethod = async (...inputs) => {
        if (!('encrypt' in this.#features)) throw new Error('encrypt not authorized');
        if (inputs.some((input) => input.cipher !== CIPHER_x25519_xsalsa20_poly1305))
            throw new Error('cipher not supported');

        const outputs: EncryptOutput[] = [];
        for (const { publicKey, cleartext } of inputs) {
            const nonce = randomBytes(box.nonceLength);
            const ciphertext = box(cleartext, nonce, publicKey, this.#signer.secretKey);
            outputs.push({ ciphertext, nonce });
        }

        return outputs as any;
    };

    #decrypt: DecryptMethod = async (...inputs) => {
        if (!('decrypt' in this.#features)) throw new Error('decrypt not authorized');
        if (inputs.some((input) => input.cipher !== CIPHER_x25519_xsalsa20_poly1305))
            throw new Error('cipher not supported');

        const outputs: DecryptOutput[] = [];
        for (const { publicKey, ciphertext, nonce } of inputs) {
            const cleartext = box.open(ciphertext, nonce, publicKey, this.#signer.secretKey);
            if (!cleartext) throw new Error('message authentication failed');
            outputs.push({ cleartext });
        }

        return outputs as any;
    };

    #allFeatures: UnionToIntersection<SolanaWalletAccountFeature> = {
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
        encrypt: {
            version: '1.0.0',
            ciphers: [CIPHER_x25519_xsalsa20_poly1305],
            encrypt: this.#encrypt,
        },
        decrypt: {
            version: '1.0.0',
            ciphers: [CIPHER_x25519_xsalsa20_poly1305],
            decrypt: this.#decrypt,
        },
    };
}

interface SolanaLedgerApp {
    publicKey: Uint8Array;
    signTransaction(transaction: Uint8Array): Promise<Uint8Array>;
}

export class LedgerSolanaWalletAccount implements WalletAccount {
    #chain: string;
    #features: SolanaSignAndSendTransactionFeature | SignTransactionFeature;
    #endpoint: string;
    // NOTE: represents some reference to an underlying device interface
    #ledger: SolanaLedgerApp = {} as SolanaLedgerApp;
    #address: string;
    #publicKey: Uint8Array;

    get address() {
        return this.#address;
    }

    get publicKey() {
        return this.#publicKey.slice();
    }

    get chain() {
        return this.#chain;
    }

    get features() {
        return { ...this.#features };
    }

    constructor({
        chain,
        features,
        endpoint,
    }: {
        chain: SolanaWalletChain;
        features?: ReadonlyArray<
            keyof UnionToIntersection<SolanaSignAndSendTransactionFeature | SignTransactionFeature>
        >;
        endpoint?: string;
    }) {
        this.#chain = chain;
        this.#features = features ? pick(this.#allFeatures, ...features) : this.#allFeatures;
        this.#endpoint = getEndpointForChain(chain, endpoint);
        this.#publicKey = new Uint8Array(this.#ledger.publicKey);
    }

    #signAndSendTransaction: SolanaSignAndSendTransactionMethod = async (...inputs) => {
        if (!('solana' in this.#features)) throw new Error('signAndSendTransaction not authorized');

        const publicKey = new PublicKey(this.#publicKey);

        const outputs: SolanaSignAndSendTransactionOutput[] = [];
        for (const input of inputs) {
            const transaction = Transaction.from(input.transaction);

            // Prompt the user with transaction to sign and send

            const rawSignature = await this.#ledger.signTransaction(input.transaction);

            transaction.addSignature(publicKey, Buffer.from(rawSignature));

            const signature = await sendAndConfirmTransaction(transaction, this.#endpoint, input.options);

            outputs.push({ signature: decode(signature) });
        }

        return outputs as any;
    };

    #signTransaction: SignTransactionMethod = async (...inputs) => {
        if (!('signTransaction' in this.#features)) throw new Error('signTransaction not authorized');

        const transactions = inputs.map(({ transaction }) => Transaction.from(transaction));

        // Prompt the user with transactions to sign

        const outputs: SignTransactionOutput[] = [];
        for (const transaction of transactions) {
            const signature = await this.#ledger.signTransaction(
                transaction.serialize({ requireAllSignatures: false })
            );
            transaction.addSignature(new PublicKey(this.#publicKey), Buffer.from(signature));
            outputs.push({ signedTransaction: transaction.serialize({ requireAllSignatures: false }) });
        }

        return outputs as any;
    };

    #allFeatures: UnionToIntersection<SolanaSignAndSendTransactionFeature | SignTransactionFeature> = {
        solana: {
            version: '1.0.0',
            signAndSendTransaction: this.#signAndSendTransaction,
        },
        signTransaction: {
            version: '1.0.0',
            signTransaction: this.#signTransaction,
        },
    };
}
