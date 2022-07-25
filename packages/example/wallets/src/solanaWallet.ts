import {
    AllWalletAccountMethodNames,
    AllWalletAccountMethods,
    Bytes,
    CHAIN_SOLANA_DEVNET,
    CHAIN_SOLANA_MAINNET,
    CHAIN_SOLANA_TESTNET,
    CIPHER_DEFAULT,
    DecryptInput,
    DecryptOutput,
    EncryptInput,
    EncryptOutput,
    pick,
    SignAndSendTransactionInput,
    SignAndSendTransactionMethod,
    SignAndSendTransactionOutput,
    SignMessageInput,
    SignMessageOutput,
    SignTransactionInput,
    SignTransactionMethod,
    SignTransactionOutput,
    UnionToIntersection,
    Wallet,
    WalletAccount,
    WalletAccountMethod,
} from '@solana/wallet-standard';
import { clusterApiUrl, Connection, Keypair, PublicKey, Signer, Transaction } from '@solana/web3.js';
import { decode } from 'bs58';
import { box, randomBytes, sign } from 'tweetnacl';
import { AbstractWallet } from './abstractWallet';

export class SolanaWallet extends AbstractWallet<SolanaWalletAccount> implements Wallet<SolanaWalletAccount> {
    private _name = 'Solana Wallet';
    private _icon =
        'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9Ijg4IiB2aWV3Qm94PSIwIDAgMTAxIDg4IiB3aWR0aD0iMTAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48bGluZWFyR3JhZGllbnQgaWQ9ImEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iOC41MjU1OCIgeDI9Ijg4Ljk5MzMiIHkxPSI5MC4wOTczIiB5Mj0iLTMuMDE2MjIiPjxzdG9wIG9mZnNldD0iLjA4IiBzdG9wLWNvbG9yPSIjOTk0NWZmIi8+PHN0b3Agb2Zmc2V0PSIuMyIgc3RvcC1jb2xvcj0iIzg3NTJmMyIvPjxzdG9wIG9mZnNldD0iLjUiIHN0b3AtY29sb3I9IiM1NDk3ZDUiLz48c3RvcCBvZmZzZXQ9Ii42IiBzdG9wLWNvbG9yPSIjNDNiNGNhIi8+PHN0b3Agb2Zmc2V0PSIuNzIiIHN0b3AtY29sb3I9IiMyOGUwYjkiLz48c3RvcCBvZmZzZXQ9Ii45NyIgc3RvcC1jb2xvcj0iIzE5ZmI5YiIvPjwvbGluZWFyR3JhZGllbnQ+PHBhdGggZD0ibTEwMC40OCA2OS4zODE3LTE2LjY3MzIgMTcuNDE5OGMtLjM2MjQuMzc4NC0uODAxLjY4MDEtMS4yODgzLjg4NjNzLTEuMDEzLjMxMjUtMS41NDQyLjMxMjJoLTc5LjAzODY3Yy0uMzc3MTQgMC0uNzQ2MDYtLjEwNzQtMS4wNjE0MjgtLjMwODgtLjMxNTM3My0uMjAxNS0uNTYzNDYyLS40ODgzLS43MTM3ODYtLjgyNTMtLjE1MDMyMzctLjMzNjktLjE5NjMzNDEtLjcwOTMtLjEzMjM3NzgtMS4wNzE0LjA2Mzk1NjItLjM2MjEuMjM1MDkyOC0uNjk4MS40OTIzODM4LS45NjY3bDE2LjY4NTY3OC0xNy40MTk4Yy4zNjE1LS4zNzc0Ljc5ODYtLjY3ODUgMS4yODQzLS44ODQ2LjQ4NTgtLjIwNjIgMS4wMDk4LS4zMTMgMS41Mzk3LS4zMTM5aDc5LjAzNDNjLjM3NzEgMCAuNzQ2LjEwNzQgMS4wNjE2LjMwODguMzE1LjIwMTUuNTYzLjQ4ODQuNzE0LjgyNTMuMTUuMzM3LjE5Ni43MDkzLjEzMiAxLjA3MTRzLS4yMzUuNjk4MS0uNDkyLjk2Njd6bS0xNi42NzMyLTM1LjA3ODVjLS4zNjI0LS4zNzg0LS44MDEtLjY4MDEtMS4yODgzLS44ODYzLS40ODczLS4yMDYxLTEuMDEzLS4zMTI0LTEuNTQ0Mi0uMzEyMWgtNzkuMDM4NjdjLS4zNzcxNCAwLS43NDYwNi4xMDczLTEuMDYxNDI4LjMwODgtLjMxNTM3My4yMDE1LS41NjM0NjIuNDg4My0uNzEzNzg2LjgyNTItLjE1MDMyMzcuMzM3LS4xOTYzMzQxLjcwOTQtLjEzMjM3NzggMS4wNzE1LjA2Mzk1NjIuMzYyLjIzNTA5MjguNjk4LjQ5MjM4MzguOTY2N2wxNi42ODU2NzggMTcuNDE5OGMuMzYxNS4zNzc0Ljc5ODYuNjc4NCAxLjI4NDMuODg0Ni40ODU4LjIwNjEgMS4wMDk4LjMxMyAxLjUzOTcuMzEzOGg3OS4wMzQzYy4zNzcxIDAgLjc0Ni0uMTA3MyAxLjA2MTYtLjMwODguMzE1LS4yMDE1LjU2My0uNDg4My43MTQtLjgyNTIuMTUtLjMzNy4xOTYtLjcwOTQuMTMyLTEuMDcxNS0uMDY0LS4zNjItLjIzNS0uNjk4LS40OTItLjk2Njd6bS04MS44NzExNy0xMi41MTI3aDc5LjAzODY3Yy41MzEyLjAwMDIgMS4wNTY5LS4xMDYgMS41NDQyLS4zMTIycy45MjU5LS41MDc5IDEuMjg4My0uODg2M2wxNi42NzMyLTE3LjQxOTgxYy4yNTctLjI2ODYyLjQyOC0uNjA0NjEuNDkyLS45NjY2OXMuMDE4LS43MzQ0Ny0uMTMyLTEuMDcxNDJjLS4xNTEtLjMzNjk1LS4zOTktLjYyMzc4NC0uNzE0LS44MjUyNTctLjMxNTYtLjIwMTQ3NC0uNjg0NS0uMzA4ODEwNTktMS4wNjE2LS4zMDg4MjNoLTc5LjAzNDNjLS41Mjk5LjAwMDg3ODQtMS4wNTM5LjEwNzY5OS0xLjUzOTcuMzEzODQ4LS40ODU3LjIwNjE1LS45MjI4LjUwNzIzOS0xLjI4NDMuODg0NjMybC0xNi42ODEzNzcgMTcuNDE5ODJjLS4yNTcwNDIuMjY4My0uNDI4MTAzMi42MDQtLjQ5MjIwNDUuOTY1Ni0uMDY0MTAxNC4zNjE3LS4wMTg0NTYxLjczMzguMTMxMzM3NSAxLjA3MDYuMTQ5Nzk0LjMzNjguMzk3MjI1LjYyMzYuNzExOTQ4LjgyNTQuMzE0NzI2LjIwMTguNjgzMDU2LjMwOTcgMS4wNTk4MjYuMzEwNnoiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=';

    get name() {
        return this._name;
    }

    get icon() {
        return this._icon;
    }

    constructor() {
        super([
            new SignerSolanaWalletAccount({ chain: CHAIN_SOLANA_MAINNET }),
            new LedgerSolanaWalletAccount({ chain: CHAIN_SOLANA_MAINNET }),
        ]);
    }
}

export type SolanaWalletAccount = SignerSolanaWalletAccount | LedgerSolanaWalletAccount;

export type SolanaWalletChain = typeof CHAIN_SOLANA_MAINNET | typeof CHAIN_SOLANA_DEVNET | typeof CHAIN_SOLANA_TESTNET;

export class SignerSolanaWalletAccount implements WalletAccount {
    private _chain: SolanaWalletChain;
    private _methods: WalletAccountMethod<this>;
    private _signer: Signer;
    private _publicKey: Bytes;

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
        return [CIPHER_DEFAULT];
    }

    get methods(): WalletAccountMethod<this> {
        return { ...this._methods };
    }

    // FIXME: can't rely on private properties for access control
    private _allMethods: AllWalletAccountMethods<this> = {
        signTransaction: (...args) => this._signTransaction(...args),
        signAndSendTransaction: (...args) => this._signAndSendTransaction(...args),
        signMessage: (...args) => this._signMessage(...args),
        encrypt: (...args) => this._encrypt(...args),
        decrypt: (...args) => this._decrypt(...args),
    };

    constructor({
        chain,
        methods,
    }: {
        chain: SolanaWalletChain;
        methods?: AllWalletAccountMethodNames<SignerSolanaWalletAccount>[];
    }) {
        this._chain = chain;
        this._methods = methods ? pick(this._allMethods, ...methods) : this._allMethods;
        this._signer = Keypair.generate();
        this._publicKey = this._signer.publicKey.toBytes();
    }

    private async _signTransaction(input: SignTransactionInput): Promise<SignTransactionOutput> {
        if (!('signTransaction' in this._methods)) throw new Error('unauthorized');

        const transactions = input.transactions.map((rawTransaction) => Transaction.from(rawTransaction));

        for (const transaction of transactions) {
            transaction.partialSign(this._signer);
        }

        const signedTransactions = transactions.map((transaction) =>
            transaction.serialize({ requireAllSignatures: false })
        );

        return { signedTransactions };
    }

    private async _signAndSendTransaction(input: SignAndSendTransactionInput): Promise<SignAndSendTransactionOutput> {
        if (!('signAndSendTransaction' in this._methods)) throw new Error('unauthorized');

        const transactions = input.transactions.map((rawTransaction) => Transaction.from(rawTransaction));

        for (const transaction of transactions) {
            transaction.partialSign(this._signer);
        }

        let endpoint: string;
        if (this._chain === CHAIN_SOLANA_MAINNET) {
            endpoint = clusterApiUrl('mainnet-beta');
        } else if (this._chain === CHAIN_SOLANA_DEVNET) {
            endpoint = clusterApiUrl('devnet');
        } else if (this._chain === CHAIN_SOLANA_TESTNET) {
            endpoint = clusterApiUrl('testnet');
        } else {
            throw new Error('invalid cluster');
        }

        const connection = new Connection(endpoint);
        const signatures = await Promise.all(
            transactions.map(async (transaction) => {
                const signature = await connection.sendRawTransaction(transaction.serialize());
                return decode(signature);
            })
        );

        return { signatures };
    }

    private async _signMessage(input: SignMessageInput): Promise<SignMessageOutput> {
        if (!('signMessage' in this._methods)) throw new Error('unauthorized');

        const signatures = input.messages.map((message) => sign.detached(message, this._signer.secretKey));

        return { signatures };
    }

    private async _encrypt(inputs: EncryptInput<this>[]): Promise<EncryptOutput<this>[]> {
        if (!('encrypt' in this._methods)) throw new Error('unauthorized');

        return inputs.map(({ publicKey, cleartexts }) => {
            const sharedKey = box.before(publicKey, this._signer.secretKey);

            const nonces = [];
            const ciphertexts = [];
            for (let i = 0; i < cleartexts.length; i++) {
                nonces[i] = randomBytes(32);
                ciphertexts[i] = box.after(cleartexts[i], nonces[i], sharedKey);
            }

            return { ciphertexts, nonces, cipher: CIPHER_DEFAULT };
        });
    }

    private async _decrypt(inputs: DecryptInput<this>[]): Promise<DecryptOutput[]> {
        if (!('decrypt' in this._methods)) throw new Error('unauthorized');

        return inputs.map(({ publicKey, ciphertexts, nonces }) => {
            const sharedKey = box.before(publicKey, this._signer.secretKey);

            const cleartexts = [];
            for (let i = 0; i < cleartexts.length; i++) {
                const cleartext = box.open.after(ciphertexts[i], nonces[i], sharedKey);
                if (!cleartext) throw new Error('message authentication failed');
                cleartexts[i] = cleartext;
            }

            return { cleartexts, cipher: CIPHER_DEFAULT };
        });
    }
}

type LedgerSolanaWalletAccountMethod = SignTransactionMethod | SignAndSendTransactionMethod;
type LedgerSolanaWalletAccountMethods = UnionToIntersection<LedgerSolanaWalletAccountMethod>;
type LedgerSolanaWalletAccountMethodNames = keyof LedgerSolanaWalletAccountMethods;

interface SolanaLedgerApp {
    publicKey: Uint8Array;
    signTransaction(transaction: Uint8Array): Promise<Uint8Array>;
}

export class LedgerSolanaWalletAccount implements WalletAccount {
    private _chain: string;
    private _methods: LedgerSolanaWalletAccountMethod;
    // NOTE: represents some reference to an underlying device interface
    private _ledger: SolanaLedgerApp = {} as SolanaLedgerApp;
    private _publicKey: Bytes;

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

    get methods() {
        return { ...this._methods };
    }

    // FIXME: can't rely on private properties for access control
    private _allMethods: LedgerSolanaWalletAccountMethods = {
        signTransaction: (...args) => this._signTransaction(...args),
        signAndSendTransaction: (...args) => this._signAndSendTransaction(...args),
    };

    constructor({ chain, methods }: { chain: SolanaWalletChain; methods?: LedgerSolanaWalletAccountMethodNames[] }) {
        this._chain = chain;
        this._methods = methods ? pick(this._allMethods, ...methods) : this._allMethods;
        this._publicKey = new Uint8Array(this._ledger.publicKey);
    }

    private async _signTransaction(input: SignTransactionInput): Promise<SignTransactionOutput> {
        if (!('signTransaction' in this._methods)) throw new Error('unauthorized');

        const transactions = input.transactions.map((rawTransaction) => Transaction.from(rawTransaction));

        for (const transaction of transactions) {
            const signature = await this._ledger.signTransaction(transaction.serialize({ requireAllSignatures: true }));
            transaction.addSignature(new PublicKey(this._publicKey), Buffer.from(signature));
        }

        const signedTransactions = transactions.map((transaction) =>
            transaction.serialize({ requireAllSignatures: false })
        );

        return { signedTransactions };
    }

    private async _signAndSendTransaction(input: SignAndSendTransactionInput): Promise<SignAndSendTransactionOutput> {
        if (!('signAndSendTransaction' in this._methods)) throw new Error('unauthorized');

        const transactions = input.transactions.map((rawTransaction) => Transaction.from(rawTransaction));

        for (const transaction of transactions) {
            const signature = await this._ledger.signTransaction(transaction.serialize({ requireAllSignatures: true }));
            transaction.addSignature(new PublicKey(this._publicKey), Buffer.from(signature));
        }

        const connection = new Connection(clusterApiUrl('mainnet-beta'));
        const signatures = await Promise.all(
            transactions.map(async (transaction) => {
                const signature = await connection.sendRawTransaction(transaction.serialize());
                return decode(signature);
            })
        );

        return { signatures };
    }
}
