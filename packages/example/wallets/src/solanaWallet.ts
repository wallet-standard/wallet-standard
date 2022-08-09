import {
    AllWalletAccountFeatureNames,
    AllWalletAccountFeatures,
    DecryptInput,
    DecryptOutput,
    EncryptInput,
    EncryptOutput,
    SignAndSendTransactionFeature,
    SignAndSendTransactionInput,
    SignAndSendTransactionOutput,
    SignMessageInput,
    SignMessageOutput,
    SignTransactionFeature,
    SignTransactionInput,
    SignTransactionOnlyFeature,
    SignTransactionOnlyInput,
    SignTransactionOnlyOutput,
    SignTransactionOutput,
    UnionToIntersection,
    Wallet,
    WalletAccount,
    WalletAccountFeature,
} from '@solana/wallet-standard';
import {
    CHAIN_SOLANA_DEVNET,
    CHAIN_SOLANA_LOCALNET,
    CHAIN_SOLANA_MAINNET,
    CHAIN_SOLANA_TESTNET,
    CIPHER_DEFAULT,
    concatBytes,
    pick,
} from '@solana/wallet-standard-util';
import { clusterApiUrl, Connection, Keypair, PublicKey, Signer, Transaction } from '@solana/web3.js';
import { decode } from 'bs58';
import { box, randomBytes, sign } from 'tweetnacl';
import { AbstractWallet } from './abstractWallet';

export class SolanaWallet extends AbstractWallet<SolanaWalletAccount> implements Wallet<SolanaWalletAccount> {
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

export class SignerSolanaWalletAccount implements WalletAccount {
    #chain: SolanaWalletChain;
    #features: WalletAccountFeature<this>;
    #signer: Signer;
    #publicKey: Uint8Array;

    get address() {
        return this.publicKey;
    }

    get publicKey() {
        return this.#publicKey.slice();
    }

    get chain() {
        return this.#chain;
    }

    get features(): WalletAccountFeature<this> {
        return { ...this.#features };
    }

    #allFeatures: AllWalletAccountFeatures<this> = {
        signTransaction: { signTransaction: (...args) => this.#signTransaction(...args) },
        signTransactionOnly: { signTransactionOnly: (...args) => this.#signTransactionOnly(...args) },
        signAndSendTransaction: { signAndSendTransaction: (...args) => this.#signAndSendTransaction(...args) },
        signMessage: { signMessage: (...args) => this.#signMessage(...args) },
        encrypt: {
            ciphers: [CIPHER_DEFAULT],
            encrypt: (...args) => this.#encrypt(...args),
        },
        decrypt: {
            ciphers: [CIPHER_DEFAULT],
            decrypt: (...args) => this.#decrypt(...args),
        },
    };

    constructor({
        chain,
        features,
    }: {
        chain: SolanaWalletChain;
        features?: AllWalletAccountFeatureNames<SignerSolanaWalletAccount>[];
    }) {
        this.#chain = chain;
        this.#features = features ? pick(this.#allFeatures, ...features) : this.#allFeatures;
        this.#signer = Keypair.generate();
        this.#publicKey = this.#signer.publicKey.toBytes();
    }

    async #signTransaction(input: SignTransactionInput<this>): Promise<SignTransactionOutput<this>> {
        if (!('signTransaction' in this.#features)) throw new Error('unauthorized');
        if (input.extraSigners?.length) throw new Error('unsupported');

        const transactions = input.transactions.map((rawTransaction) => Transaction.from(rawTransaction));

        // Prompt the user with transactions to sign

        for (const transaction of transactions) {
            transaction.partialSign(this.#signer);
        }

        const signedTransactions = transactions.map((transaction) =>
            transaction.serialize({ requireAllSignatures: false })
        );

        return { signedTransactions };
    }

    async #signTransactionOnly(input: SignTransactionOnlyInput<this>): Promise<SignTransactionOnlyOutput<this>> {
        if (!('signTransactionOnly' in this.#features)) throw new Error('unauthorized');
        if (input.extraSigners?.length) throw new Error('unsupported');

        const transactions = input.transactions.map((rawTransaction) => Transaction.from(rawTransaction));

        // Prompt the user with transactions to sign

        const signatures: Uint8Array[] = [];
        for (const transaction of transactions) {
            const message = transaction.compileMessage().serialize();
            const signature = sign.detached(message, this.#signer.secretKey);
            signatures.push(signature);
        }

        return { signatures };
    }

    async #signAndSendTransaction(
        input: SignAndSendTransactionInput<this>
    ): Promise<SignAndSendTransactionOutput<this>> {
        if (!('signAndSendTransaction' in this.#features)) throw new Error('unauthorized');
        if (input.extraSigners?.length) throw new Error('unsupported');

        const transactions = input.transactions.map((rawTransaction) => Transaction.from(rawTransaction));

        // Prompt the user with transactions to sign and send

        for (const transaction of transactions) {
            transaction.partialSign(this.#signer);
        }

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
        const signatures: Uint8Array[] = [];
        for (const transaction of transactions) {
            const signature = await connection.sendRawTransaction(transaction.serialize());
            signatures.push(decode(signature));
        }

        return { signatures };
    }

    async #signMessage(input: SignMessageInput<this>): Promise<SignMessageOutput<this>> {
        if (!('signMessage' in this.#features)) throw new Error('unauthorized');
        if (input.extraSigners?.length) throw new Error('unsupported');

        // Prompt the user with messages to sign

        const signedMessages: Uint8Array[] = [];
        for (const message of input.messages) {
            const signature = sign.detached(message, this.#signer.secretKey);
            signedMessages.push(concatBytes(message, signature));
        }

        return { signedMessages };
    }

    async #encrypt(inputs: ReadonlyArray<EncryptInput<this>>): Promise<ReadonlyArray<EncryptOutput<this>>> {
        if (!('encrypt' in this.#features)) throw new Error('unauthorized');

        // Prompt the user with data to encrypt

        const outputs: EncryptOutput<this>[] = [];
        for (const { publicKey, cleartexts } of inputs) {
            const sharedKey = box.before(publicKey, this.#signer.secretKey);

            const nonces = [];
            const ciphertexts = [];
            for (let i = 0; i < cleartexts.length; i++) {
                nonces[i] = randomBytes(32);
                ciphertexts[i] = box.after(cleartexts[i], nonces[i], sharedKey);
            }

            outputs.push({ ciphertexts, nonces, cipher: CIPHER_DEFAULT });
        }

        return outputs;
    }

    async #decrypt(inputs: ReadonlyArray<DecryptInput<this>>): Promise<ReadonlyArray<DecryptOutput<this>>> {
        if (!('decrypt' in this.#features)) throw new Error('unauthorized');

        // Prompt the user with data to decrypt

        const outputs: DecryptOutput<this>[] = [];
        for (const { publicKey, ciphertexts, nonces } of inputs) {
            const sharedKey = box.before(publicKey, this.#signer.secretKey);

            const cleartexts = [];
            for (let i = 0; i < cleartexts.length; i++) {
                const cleartext = box.open.after(ciphertexts[i], nonces[i], sharedKey);
                if (!cleartext) throw new Error('message authentication failed');
                cleartexts[i] = cleartext;
            }

            outputs.push({ cleartexts });
        }

        return outputs;
    }
}

type LedgerSolanaWalletAccountFeature =
    | SignTransactionFeature<LedgerSolanaWalletAccount>
    | SignTransactionOnlyFeature<LedgerSolanaWalletAccount>
    | SignAndSendTransactionFeature<LedgerSolanaWalletAccount>;
type LedgerSolanaWalletAccountFeatures = UnionToIntersection<LedgerSolanaWalletAccountFeature>;
type LedgerSolanaWalletAccountFeatureNames = keyof LedgerSolanaWalletAccountFeatures;

interface SolanaLedgerApp {
    publicKey: Uint8Array;
    signTransaction(transaction: Uint8Array): Promise<Uint8Array>;
}

export class LedgerSolanaWalletAccount implements WalletAccount {
    #chain: string;
    #features: LedgerSolanaWalletAccountFeature;
    // NOTE: represents some reference to an underlying device interface
    #ledger: SolanaLedgerApp = {} as SolanaLedgerApp;
    #publicKey: Uint8Array;

    get address() {
        return this.publicKey;
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

    #allFeatures: SignTransactionFeature<this> &
        SignTransactionOnlyFeature<this> &
        SignAndSendTransactionFeature<this> = {
        signTransaction: { signTransaction: (...args) => this.#signTransaction(...args) },
        signTransactionOnly: { signTransactionOnly: (...args) => this.#signTransactionOnly(...args) },
        signAndSendTransaction: { signAndSendTransaction: (...args) => this.#signAndSendTransaction(...args) },
    };

    constructor({ chain, features }: { chain: SolanaWalletChain; features?: LedgerSolanaWalletAccountFeatureNames[] }) {
        this.#chain = chain;
        this.#features = features ? pick(this.#allFeatures, ...features) : this.#allFeatures;
        this.#publicKey = new Uint8Array(this.#ledger.publicKey);
    }

    async #signTransaction(input: SignTransactionInput<this>): Promise<SignTransactionOutput<this>> {
        if (!('signTransaction' in this.#features)) throw new Error('unauthorized');
        if (input.extraSigners?.length) throw new Error('unsupported');

        const transactions = input.transactions.map((rawTransaction) => Transaction.from(rawTransaction));

        // Prompt the user with transactions to sign

        for (const transaction of transactions) {
            const signature = await this.#ledger.signTransaction(
                transaction.serialize({ requireAllSignatures: false })
            );
            transaction.addSignature(new PublicKey(this.#publicKey), Buffer.from(signature));
        }

        const signedTransactions = transactions.map((transaction) =>
            transaction.serialize({ requireAllSignatures: false })
        );

        return { signedTransactions };
    }

    async #signTransactionOnly(input: SignTransactionOnlyInput<this>): Promise<SignTransactionOnlyOutput<this>> {
        if (!('signTransactionOnly' in this.#features)) throw new Error('unauthorized');
        if (input.extraSigners?.length) throw new Error('unsupported');

        const transactions = input.transactions.map((rawTransaction) => Transaction.from(rawTransaction));

        // Prompt the user with transactions to sign

        const signatures: Uint8Array[] = [];
        for (const transaction of transactions) {
            const signature = await this.#ledger.signTransaction(transaction.serialize({ requireAllSignatures: true }));
            signatures.push(signature);
        }

        return { signatures };
    }

    async #signAndSendTransaction(
        input: SignAndSendTransactionInput<this>
    ): Promise<SignAndSendTransactionOutput<this>> {
        if (!('signAndSendTransaction' in this.#features)) throw new Error('unauthorized');
        if (input.extraSigners?.length) throw new Error('unsupported');

        const transactions = input.transactions.map((rawTransaction) => Transaction.from(rawTransaction));

        // Prompt the user with transactions to sign and send

        for (const transaction of transactions) {
            const signature = await this.#ledger.signTransaction(
                transaction.serialize({ requireAllSignatures: false })
            );
            transaction.addSignature(new PublicKey(this.#publicKey), Buffer.from(signature));
        }

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
        const signatures = await Promise.all(
            transactions.map(async (transaction) => {
                const signature = await connection.sendRawTransaction(transaction.serialize());
                return decode(signature);
            })
        );

        return { signatures };
    }
}
