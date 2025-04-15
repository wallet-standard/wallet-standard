import type { ConnectFeature, ConnectMethod, EventsFeature, Wallet } from '@wallet-standard/core';
import type { EthereumChain } from '@wallet-standard/ethereum';
import { ETHEREUM_CHAINS } from '@wallet-standard/ethereum';
import type {
    SignAndSendTransactionFeature,
    SignAndSendTransactionMethod,
    SignAndSendTransactionOutput,
    SignMessageFeature,
    SignMessageMethod,
    SignMessageOutput,
    SignTransactionFeature,
    SignTransactionMethod,
    SignTransactionOutput,
} from '@wallet-standard/experimental';
import ethers from 'ethers';
import { AbstractWallet, SignerWalletAccount } from './abstractWallet.js';

export class EthereumWallet extends AbstractWallet implements Wallet {
    declare protected _accounts: SignerWalletAccount[];

    #name = 'Ethereum Wallet' as const;
    #icon =
        'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9Ijg4IiB2aWV3Qm94PSIwIDAgMTAxIDg4IiB3aWR0aD0iMTAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48bGluZWFyR3JhZGllbnQgaWQ9ImEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iOC41MjU1OCIgeDI9Ijg4Ljk5MzMiIHkxPSI5MC4wOTczIiB5Mj0iLTMuMDE2MjIiPjxzdG9wIG9mZnNldD0iLjA4IiBzdG9wLWNvbG9yPSIjOTk0NWZmIi8+PHN0b3Agb2Zmc2V0PSIuMyIgc3RvcC1jb2xvcj0iIzg3NTJmMyIvPjxzdG9wIG9mZnNldD0iLjUiIHN0b3AtY29sb3I9IiM1NDk3ZDUiLz48c3RvcCBvZmZzZXQ9Ii42IiBzdG9wLWNvbG9yPSIjNDNiNGNhIi8+PHN0b3Agb2Zmc2V0PSIuNzIiIHN0b3AtY29sb3I9IiMyOGUwYjkiLz48c3RvcCBvZmZzZXQ9Ii45NyIgc3RvcC1jb2xvcj0iIzE5ZmI5YiIvPjwvbGluZWFyR3JhZGllbnQ+PHBhdGggZD0ibTEwMC40OCA2OS4zODE3LTE2LjY3MzIgMTcuNDE5OGMtLjM2MjQuMzc4NC0uODAxLjY4MDEtMS4yODgzLjg4NjNzLTEuMDEzLjMxMjUtMS41NDQyLjMxMjJoLTc5LjAzODY3Yy0uMzc3MTQgMC0uNzQ2MDYtLjEwNzQtMS4wNjE0MjgtLjMwODgtLjMxNTM3My0uMjAxNS0uNTYzNDYyLS40ODgzLS43MTM3ODYtLjgyNTMtLjE1MDMyMzctLjMzNjktLjE5NjMzNDEtLjcwOTMtLjEzMjM3NzgtMS4wNzE0LjA2Mzk1NjItLjM2MjEuMjM1MDkyOC0uNjk4MS40OTIzODM4LS45NjY3bDE2LjY4NTY3OC0xNy40MTk4Yy4zNjE1LS4zNzc0Ljc5ODYtLjY3ODUgMS4yODQzLS44ODQ2LjQ4NTgtLjIwNjIgMS4wMDk4LS4zMTMgMS41Mzk3LS4zMTM5aDc5LjAzNDNjLjM3NzEgMCAuNzQ2LjEwNzQgMS4wNjE2LjMwODguMzE1LjIwMTUuNTYzLjQ4ODQuNzE0LjgyNTMuMTUuMzM3LjE5Ni43MDkzLjEzMiAxLjA3MTRzLS4yMzUuNjk4MS0uNDkyLjk2Njd6bS0xNi42NzMyLTM1LjA3ODVjLS4zNjI0LS4zNzg0LS44MDEtLjY4MDEtMS4yODgzLS44ODYzLS40ODczLS4yMDYxLTEuMDEzLS4zMTI0LTEuNTQ0Mi0uMzEyMWgtNzkuMDM4NjdjLS4zNzcxNCAwLS43NDYwNi4xMDczLTEuMDYxNDI4LjMwODgtLjMxNTM3My4yMDE1LS41NjM0NjIuNDg4My0uNzEzNzg2LjgyNTItLjE1MDMyMzcuMzM3LS4xOTYzMzQxLjcwOTQtLjEzMjM3NzggMS4wNzE1LjA2Mzk1NjIuMzYyLjIzNTA5MjguNjk4LjQ5MjM4MzguOTY2N2wxNi42ODU2NzggMTcuNDE5OGMuMzYxNS4zNzc0Ljc5ODYuNjc4NCAxLjI4NDMuODg0Ni40ODU4LjIwNjEgMS4wMDk4LjMxMyAxLjUzOTcuMzEzOGg3OS4wMzQzYy4zNzcxIDAgLjc0Ni0uMTA3MyAxLjA2MTYtLjMwODguMzE1LS4yMDE1LjU2My0uNDg4My43MTQtLjgyNTIuMTUtLjMzNy4xOTYtLjcwOTQuMTMyLTEuMDcxNS0uMDY0LS4zNjItLjIzNS0uNjk4LS40OTItLjk2Njd6bS04MS44NzExNy0xMi41MTI3aDc5LjAzODY3Yy41MzEyLjAwMDIgMS4wNTY5LS4xMDYgMS41NDQyLS4zMTIycy45MjU5LS41MDc5IDEuMjg4My0uODg2M2wxNi42NzMyLTE3LjQxOTgxYy4yNTctLjI2ODYyLjQyOC0uNjA0NjEuNDkyLS45NjY2OXMuMDE4LS43MzQ0Ny0uMTMyLTEuMDcxNDJjLS4xNTEtLjMzNjk1LS4zOTktLjYyMzc4NC0uNzE0LS44MjUyNTctLjMxNTYtLjIwMTQ3NC0uNjg0NS0uMzA4ODEwNTktMS4wNjE2LS4zMDg4MjNoLTc5LjAzNDNjLS41Mjk5LjAwMDg3ODQtMS4wNTM5LjEwNzY5OS0xLjUzOTcuMzEzODQ4LS40ODU3LjIwNjE1LS45MjI4LjUwNzIzOS0xLjI4NDMuODg0NjMybC0xNi42ODEzNzcgMTcuNDE5ODJjLS4yNTcwNDIuMjY4My0uNDI4MTAzMi42MDQtLjQ5MjIwNDUuOTY1Ni0uMDY0MTAxNC4zNjE3LS4wMTg0NTYxLjczMzguMTMxMzM3NSAxLjA3MDYuMTQ5Nzk0LjMzNjguMzk3MjI1LjYyMzYuNzExOTQ4LjgyNTQuMzE0NzI2LjIwMTguNjgzMDU2LjMwOTcgMS4wNTk4MjYuMzEwNnoiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=' as const;
    #keys: Record<string, { wallet: ethers.Wallet }>;

    get name() {
        return this.#name;
    }

    get icon() {
        return this.#icon;
    }

    get chains() {
        return ETHEREUM_CHAINS.slice();
    }

    get features(): ConnectFeature &
        EventsFeature &
        SignAndSendTransactionFeature &
        SignTransactionFeature &
        SignMessageFeature {
        return {
            'standard:connect': {
                version: '1.0.0',
                connect: this.#connect,
            },
            'standard:events': {
                version: '1.0.0',
                on: this._on,
            },
            'experimental:signAndSendTransaction': {
                version: '1.0.0',
                signAndSendTransaction: this.#signAndSendTransaction,
            },
            'experimental:signTransaction': {
                version: '1.0.0',
                signTransaction: this.#signTransaction,
            },
            'experimental:signMessage': {
                version: '1.0.0',
                signMessage: this.#signMessage,
            },
        };
    }

    constructor() {
        const wallet = ethers.Wallet.createRandom();
        const address = wallet.address;
        const publicKey = ethers.utils.arrayify(wallet.publicKey);

        super([
            new SignerWalletAccount({
                address,
                publicKey,
                chains: ETHEREUM_CHAINS,
                features: [
                    'experimental:signAndSendTransaction',
                    'experimental:signTransaction',
                    'experimental:signMessage',
                ],
            }),
        ]);

        if (new.target === EthereumWallet) {
            Object.freeze(this);
        }

        this.#keys = { [address]: { wallet } };
    }

    #connect: ConnectMethod = async ({ silent } = {}) => {
        if (!silent && !confirm('Do you want to connect?')) throw new Error('connection declined');

        return { accounts: this.accounts };
    };

    #signAndSendTransaction: SignAndSendTransactionMethod = async (...inputs) => {
        const outputs: SignAndSendTransactionOutput[] = [];
        for (const { transaction, account, chain } of inputs) {
            if (!(account instanceof SignerWalletAccount)) throw new Error('invalid account');
            if (!account.features.includes('experimental:signAndSendTransaction')) throw new Error('invalid feature');

            if (!this.chains.includes(chain as EthereumChain)) throw new Error('invalid chain');

            const parsedTransaction = ethers.utils.parseTransaction(transaction);

            const wallet = this.#keys[account.address]?.wallet;
            if (!wallet) throw new Error('invalid account');

            if (!confirm('Do you want to sign this transaction?')) throw new Error('signature declined');

            const { hash } = await wallet.connect(ethers.getDefaultProvider()).sendTransaction({
                ...parsedTransaction,
                // HACK: signTransaction expects a `number` or `undefined`, not `null`
                type: parsedTransaction.type ?? undefined,
            });

            outputs.push({ signature: ethers.utils.arrayify(hash) });
        }

        return outputs;
    };

    #signTransaction: SignTransactionMethod = async (...inputs) => {
        const outputs: SignTransactionOutput[] = [];
        for (const { transaction, account, chain } of inputs) {
            if (!(account instanceof SignerWalletAccount)) throw new Error('invalid account');
            if (!account.features.includes('experimental:signTransaction')) throw new Error('invalid feature');

            if (chain && !this.chains.includes(chain as EthereumChain)) throw new Error('invalid chain');

            const parsedTransaction = ethers.utils.parseTransaction(transaction);

            const wallet = this.#keys[account.address]?.wallet;
            if (!wallet) throw new Error('invalid account');

            if (!confirm('Do you want to sign this transaction?')) throw new Error('signature declined');

            const signedTransaction = await wallet.signTransaction({
                ...parsedTransaction,
                // HACK: signTransaction expects a `number` or `undefined`, not `null`
                type: parsedTransaction.type ?? undefined,
            });

            outputs.push({ signedTransaction: ethers.utils.arrayify(signedTransaction) });
        }

        return outputs;
    };

    #signMessage: SignMessageMethod = async (...inputs) => {
        const outputs: SignMessageOutput[] = [];
        for (const { account, message } of inputs) {
            if (!(account instanceof SignerWalletAccount)) throw new Error('invalid account');
            if (!account.features.includes('experimental:signMessage')) throw new Error('invalid feature');

            const wallet = this.#keys[account.address]?.wallet;
            if (!wallet) throw new Error('invalid account');

            if (!confirm('Do you want to sign this message?')) throw new Error('signature declined');

            const signature = await wallet.signMessage(message);

            // TODO: avoid prefixing if the message is already prefixed
            const signedMessage = ethers.utils.concat([
                ethers.utils.toUtf8Bytes('\x19Ethereum Signed Message:\n'),
                ethers.utils.toUtf8Bytes(String(message.length)),
                message,
            ]);

            outputs.push({
                signedMessage,
                signature: ethers.utils.arrayify(signature),
            });
        }

        return outputs;
    };
}
