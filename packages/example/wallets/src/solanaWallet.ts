import type {
    SolanaChain,
    SolanaSignAndSendTransactionFeature,
    SolanaSignAndSendTransactionMethod,
    SolanaSignAndSendTransactionOutput,
    SolanaSignMessageFeature,
    SolanaSignMessageMethod,
    SolanaSignMessageOutput,
    SolanaSignTransactionFeature,
    SolanaSignTransactionMethod,
    SolanaSignTransactionOutput,
} from '@solana/wallet-standard';
import { getEndpointForChain, SOLANA_CHAINS } from '@solana/wallet-standard';
import { Keypair, PublicKey, Transaction } from '@solana/web3.js';
import type { ConnectFeature, ConnectMethod, EventsFeature, ReadonlyUint8Array, Wallet } from '@wallet-standard/core';
import type {
    DecryptFeature,
    DecryptMethod,
    DecryptOutput,
    EncryptFeature,
    EncryptMethod,
    EncryptOutput,
} from '@wallet-standard/experimental';
import { CIPHER_x25519_xsalsa20_poly1305 } from '@wallet-standard/experimental';
import bs58 from 'bs58';
import { box, randomBytes, sign } from 'tweetnacl';
import {
    AbstractWallet,
    LedgerWalletAccount,
    PossiblyLedgerWalletAccount,
    SignerWalletAccount,
} from './abstractWallet.js';
import { sendAndConfirmTransaction } from './solana.js';

// A reference to an underlying Ledger device that has already been connected and account initialized
interface SolanaLedgerApp {
    publicKey: ReadonlyUint8Array;

    signTransaction(transaction: ReadonlyUint8Array): Promise<Uint8Array>;
}

export class SolanaWallet extends AbstractWallet implements Wallet {
    protected declare _accounts: PossiblyLedgerWalletAccount[];

    #name = 'Solana Wallet' as const;
    #icon =
        'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9Ijg4IiB2aWV3Qm94PSIwIDAgMTAxIDg4IiB3aWR0aD0iMTAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48bGluZWFyR3JhZGllbnQgaWQ9ImEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iOC41MjU1OCIgeDI9Ijg4Ljk5MzMiIHkxPSI5MC4wOTczIiB5Mj0iLTMuMDE2MjIiPjxzdG9wIG9mZnNldD0iLjA4IiBzdG9wLWNvbG9yPSIjOTk0NWZmIi8+PHN0b3Agb2Zmc2V0PSIuMyIgc3RvcC1jb2xvcj0iIzg3NTJmMyIvPjxzdG9wIG9mZnNldD0iLjUiIHN0b3AtY29sb3I9IiM1NDk3ZDUiLz48c3RvcCBvZmZzZXQ9Ii42IiBzdG9wLWNvbG9yPSIjNDNiNGNhIi8+PHN0b3Agb2Zmc2V0PSIuNzIiIHN0b3AtY29sb3I9IiMyOGUwYjkiLz48c3RvcCBvZmZzZXQ9Ii45NyIgc3RvcC1jb2xvcj0iIzE5ZmI5YiIvPjwvbGluZWFyR3JhZGllbnQ+PHBhdGggZD0ibTEwMC40OCA2OS4zODE3LTE2LjY3MzIgMTcuNDE5OGMtLjM2MjQuMzc4NC0uODAxLjY4MDEtMS4yODgzLjg4NjNzLTEuMDEzLjMxMjUtMS41NDQyLjMxMjJoLTc5LjAzODY3Yy0uMzc3MTQgMC0uNzQ2MDYtLjEwNzQtMS4wNjE0MjgtLjMwODgtLjMxNTM3My0uMjAxNS0uNTYzNDYyLS40ODgzLS43MTM3ODYtLjgyNTMtLjE1MDMyMzctLjMzNjktLjE5NjMzNDEtLjcwOTMtLjEzMjM3NzgtMS4wNzE0LjA2Mzk1NjItLjM2MjEuMjM1MDkyOC0uNjk4MS40OTIzODM4LS45NjY3bDE2LjY4NTY3OC0xNy40MTk4Yy4zNjE1LS4zNzc0Ljc5ODYtLjY3ODUgMS4yODQzLS44ODQ2LjQ4NTgtLjIwNjIgMS4wMDk4LS4zMTMgMS41Mzk3LS4zMTM5aDc5LjAzNDNjLjM3NzEgMCAuNzQ2LjEwNzQgMS4wNjE2LjMwODguMzE1LjIwMTUuNTYzLjQ4ODQuNzE0LjgyNTMuMTUuMzM3LjE5Ni43MDkzLjEzMiAxLjA3MTRzLS4yMzUuNjk4MS0uNDkyLjk2Njd6bS0xNi42NzMyLTM1LjA3ODVjLS4zNjI0LS4zNzg0LS44MDEtLjY4MDEtMS4yODgzLS44ODYzLS40ODczLS4yMDYxLTEuMDEzLS4zMTI0LTEuNTQ0Mi0uMzEyMWgtNzkuMDM4NjdjLS4zNzcxNCAwLS43NDYwNi4xMDczLTEuMDYxNDI4LjMwODgtLjMxNTM3My4yMDE1LS41NjM0NjIuNDg4My0uNzEzNzg2LjgyNTItLjE1MDMyMzcuMzM3LS4xOTYzMzQxLjcwOTQtLjEzMjM3NzggMS4wNzE1LjA2Mzk1NjIuMzYyLjIzNTA5MjguNjk4LjQ5MjM4MzguOTY2N2wxNi42ODU2NzggMTcuNDE5OGMuMzYxNS4zNzc0Ljc5ODYuNjc4NCAxLjI4NDMuODg0Ni40ODU4LjIwNjEgMS4wMDk4LjMxMyAxLjUzOTcuMzEzOGg3OS4wMzQzYy4zNzcxIDAgLjc0Ni0uMTA3MyAxLjA2MTYtLjMwODguMzE1LS4yMDE1LjU2My0uNDg4My43MTQtLjgyNTIuMTUtLjMzNy4xOTYtLjcwOTQuMTMyLTEuMDcxNS0uMDY0LS4zNjItLjIzNS0uNjk4LS40OTItLjk2Njd6bS04MS44NzExNy0xMi41MTI3aDc5LjAzODY3Yy41MzEyLjAwMDIgMS4wNTY5LS4xMDYgMS41NDQyLS4zMTIycy45MjU5LS41MDc5IDEuMjg4My0uODg2M2wxNi42NzMyLTE3LjQxOTgxYy4yNTctLjI2ODYyLjQyOC0uNjA0NjEuNDkyLS45NjY2OXMuMDE4LS43MzQ0Ny0uMTMyLTEuMDcxNDJjLS4xNTEtLjMzNjk1LS4zOTktLjYyMzc4NC0uNzE0LS44MjUyNTctLjMxNTYtLjIwMTQ3NC0uNjg0NS0uMzA4ODEwNTktMS4wNjE2LS4zMDg4MjNoLTc5LjAzNDNjLS41Mjk5LjAwMDg3ODQtMS4wNTM5LjEwNzY5OS0xLjUzOTcuMzEzODQ4LS40ODU3LjIwNjE1LS45MjI4LjUwNzIzOS0xLjI4NDMuODg0NjMybC0xNi42ODEzNzcgMTcuNDE5ODJjLS4yNTcwNDIuMjY4My0uNDI4MTAzMi42MDQtLjQ5MjIwNDUuOTY1Ni0uMDY0MTAxNC4zNjE3LS4wMTg0NTYxLjczMzguMTMxMzM3NSAxLjA3MDYuMTQ5Nzk0LjMzNjguMzk3MjI1LjYyMzYuNzExOTQ4LjgyNTQuMzE0NzI2LjIwMTguNjgzMDU2LjMwOTcgMS4wNTk4MjYuMzEwNnoiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=' as const;
    #ledger: SolanaLedgerApp;
    #keys: Record<string, { keypair: Keypair }>;

    get name() {
        return this.#name;
    }

    get icon() {
        return this.#icon;
    }

    get chains() {
        return SOLANA_CHAINS.slice();
    }

    get features(): ConnectFeature &
        EventsFeature &
        SolanaSignAndSendTransactionFeature &
        SolanaSignTransactionFeature &
        SolanaSignMessageFeature &
        EncryptFeature &
        DecryptFeature {
        return {
            'standard:connect': {
                version: '1.0.0',
                connect: this.#connect,
            },
            'standard:events': {
                version: '1.0.0',
                on: this._on,
            },
            'solana:signAndSendTransaction': {
                version: '1.0.0',
                supportedTransactionVersions: ['legacy'],
                signAndSendTransaction: this.#signAndSendTransaction,
            },
            'solana:signTransaction': {
                version: '1.0.0',
                supportedTransactionVersions: ['legacy'],
                signTransaction: this.#signTransaction,
            },
            'solana:signMessage': {
                version: '1.0.0',
                signMessage: this.#signMessage,
            },
            'experimental:encrypt': {
                version: '1.0.0',
                ciphers: [CIPHER_x25519_xsalsa20_poly1305] as const,
                encrypt: this.#encrypt,
            },
            'experimental:decrypt': {
                version: '1.0.0',
                ciphers: [CIPHER_x25519_xsalsa20_poly1305] as const,
                decrypt: this.#decrypt,
            },
        };
    }

    constructor() {
        const ledger = {} as SolanaLedgerApp;
        const keypair = Keypair.generate();
        const address = keypair.publicKey.toBase58();
        const publicKey = keypair.publicKey.toBytes();

        super([
            new SignerWalletAccount({
                address,
                publicKey,
                chains: SOLANA_CHAINS,
                features: [
                    'solana:signAndSendTransaction',
                    'solana:signTransaction',
                    'solana:signMessage',
                    'experimental:encrypt',
                    'experimental:decrypt',
                ],
            }),
            new LedgerWalletAccount({
                address: bs58.encode(ledger.publicKey as Uint8Array),
                publicKey: ledger.publicKey,
                chains: SOLANA_CHAINS,
                features: ['solana:signAndSendTransaction', 'solana:signTransaction'],
            }),
        ]);

        if (new.target === SolanaWallet) {
            Object.freeze(this);
        }

        this.#ledger = ledger;
        this.#keys = { [address]: { keypair } };
    }

    #connect: ConnectMethod = async ({ silent } = {}) => {
        if (!silent && !confirm('Do you want to connect?')) throw new Error('connection declined');

        return { accounts: this.accounts };
    };

    #signAndSendTransaction: SolanaSignAndSendTransactionMethod = async (...inputs) => {
        const outputs: SolanaSignAndSendTransactionOutput[] = [];
        for (const { transaction, account, chain, options } of inputs) {
            if (!(account instanceof PossiblyLedgerWalletAccount)) throw new Error('invalid account');
            if (!account.features.includes('solana:signAndSendTransaction')) throw new Error('invalid feature');

            if (!this.chains.includes(chain as SolanaChain)) throw new Error('invalid chain');
            const endpoint = getEndpointForChain(chain as SolanaChain);

            const parsedTransaction = Transaction.from(transaction);

            if (account.ledger) {
                if (!confirm('Do you want to sign this transaction?')) throw new Error('signature declined');

                const signature = await this.#ledger.signTransaction(transaction);

                parsedTransaction.addSignature(new PublicKey(account.publicKey), Buffer.from(signature));
            } else {
                const keypair = this.#keys[account.address]?.keypair;
                if (!keypair) throw new Error('account invalid');

                if (!confirm('Do you want to sign this transaction?')) throw new Error('signature declined');

                parsedTransaction.partialSign(keypair);
            }

            const signature = await sendAndConfirmTransaction(parsedTransaction, endpoint, options);

            outputs.push({ signature: bs58.decode(signature) });
        }

        return outputs;
    };

    #signTransaction: SolanaSignTransactionMethod = async (...inputs) => {
        const outputs: SolanaSignTransactionOutput[] = [];
        for (const { transaction, account, chain } of inputs) {
            if (!(account instanceof PossiblyLedgerWalletAccount)) throw new Error('invalid account');
            if (!account.features.includes('solana:signTransaction')) throw new Error('invalid feature');

            if (chain && !this.chains.includes(chain as SolanaChain)) throw new Error('invalid chain');

            const parsedTransaction = Transaction.from(transaction);

            if (account.ledger) {
                if (!confirm('Do you want to sign this transaction?')) throw new Error('signature declined');

                const signature = await this.#ledger.signTransaction(transaction);

                parsedTransaction.addSignature(new PublicKey(account.publicKey), Buffer.from(signature));
            } else {
                const keypair = this.#keys[account.address]?.keypair;
                if (!keypair) throw new Error('invalid account');

                if (!confirm('Do you want to sign this transaction?')) throw new Error('signature declined');

                parsedTransaction.partialSign(keypair);
            }

            outputs.push({
                signedTransaction: new Uint8Array(parsedTransaction.serialize({ requireAllSignatures: false })),
            });
        }

        return outputs;
    };

    #signMessage: SolanaSignMessageMethod = async (...inputs) => {
        const outputs: SolanaSignMessageOutput[] = [];
        for (const { account, message } of inputs) {
            if (!(account instanceof PossiblyLedgerWalletAccount)) throw new Error('invalid account');
            if (!account.features.includes('solana:signMessage')) throw new Error('invalid feature');

            const keypair = this.#keys[account.address]?.keypair;
            if (!keypair) throw new Error('invalid account');

            if (!confirm('Do you want to sign this message?')) throw new Error('signature declined');

            outputs.push({
                signedMessage: message,
                signature: sign.detached(message, keypair.secretKey),
            });
        }

        return outputs;
    };

    #encrypt: EncryptMethod = async (...inputs) => {
        const outputs: EncryptOutput[] = [];
        for (const { account, cipher, publicKey, cleartext } of inputs) {
            if (!(account instanceof PossiblyLedgerWalletAccount)) throw new Error('invalid account');
            if (!account.features.includes('experimental:encrypt')) throw new Error('invalid feature');

            if (!this.features['experimental:encrypt'].ciphers.includes(cipher)) throw new Error('invalid cipher');

            const keypair = this.#keys[account.address]?.keypair;
            if (!keypair) throw new Error('invalid account');

            const nonce = randomBytes(box.nonceLength);
            const ciphertext = box(cleartext as Uint8Array, nonce, publicKey as Uint8Array, keypair.secretKey);
            outputs.push({ ciphertext, nonce });
        }

        return outputs;
    };

    #decrypt: DecryptMethod = async (...inputs) => {
        const outputs: DecryptOutput[] = [];
        for (const { account, cipher, publicKey, ciphertext, nonce } of inputs) {
            if (!(account instanceof PossiblyLedgerWalletAccount)) throw new Error('invalid account');
            if (!account.features.includes('experimental:decrypt')) throw new Error('invalid feature');

            if (!this.features['experimental:decrypt'].ciphers.includes(cipher)) throw new Error('invalid cipher');

            const keypair = this.#keys[account.address]?.keypair;
            if (!keypair) throw new Error('invalid account');

            const cleartext = box.open(
                ciphertext as Uint8Array,
                nonce as Uint8Array,
                publicKey as Uint8Array,
                keypair.secretKey
            );
            if (!cleartext) throw new Error('message authentication failed');
            outputs.push({ cleartext });
        }

        return outputs;
    };
}
