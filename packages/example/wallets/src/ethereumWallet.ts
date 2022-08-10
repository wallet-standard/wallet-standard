import {
    AllWalletAccountFeatureNames,
    AllWalletAccountFeatures,
    DecryptInputs,
    DecryptOutput,
    DecryptOutputs,
    EncryptInputs,
    EncryptOutput,
    EncryptOutputs,
    SignAndSendTransactionInputs,
    SignAndSendTransactionOutput,
    SignAndSendTransactionOutputs,
    SignMessageInputs,
    SignMessageOutput,
    SignMessageOutputs,
    SignTransactionInputs,
    SignTransactionOnlyInputs,
    SignTransactionOnlyOutput,
    SignTransactionOnlyOutputs,
    SignTransactionOutput,
    SignTransactionOutputs,
    Wallet,
    WalletAccount,
    WalletAccountFeature,
} from '@solana/wallet-standard';
import { CHAIN_ETHEREUM, CIPHER_x25519_xsalsa20_poly1305, pick } from '@solana/wallet-standard-util';
import ethers from 'ethers';
import { box, randomBytes } from 'tweetnacl';
import { AbstractWallet } from './abstractWallet';

export class EthereumWallet extends AbstractWallet<EthereumWalletAccount> implements Wallet<EthereumWalletAccount> {
    #name = 'Ethereum Wallet';
    #icon =
        'data:image/svg+xml;base64,PHN2ZyBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGZpbGwtcnVsZT0iZXZlbm9kZCIgaW1hZ2UtcmVuZGVyaW5nPSJvcHRpbWl6ZVF1YWxpdHkiIHNoYXBlLXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB2aWV3Qm94PSIwIDAgNzg0LjM3IDEyNzcuMzkiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbC1ydWxlPSJub256ZXJvIj48cGF0aCBkPSJtMzkyLjA3IDAtOC41NyAyOS4xMXY4NDQuNjNsOC41NyA4LjU1IDM5Mi4wNi0yMzEuNzV6IiBmaWxsPSIjMzQzNDM0Ii8+PHBhdGggZD0ibTM5Mi4wNyAwLTM5Mi4wNyA2NTAuNTQgMzkyLjA3IDIzMS43NXYtNDA5Ljk2eiIgZmlsbD0iIzhjOGM4YyIvPjxwYXRoIGQ9Im0zOTIuMDcgOTU2LjUyLTQuODMgNS44OXYzMDAuODdsNC44MyAxNC4xIDM5Mi4zLTU1Mi40OXoiIGZpbGw9IiMzYzNjM2IiLz48cGF0aCBkPSJtMzkyLjA3IDEyNzcuMzh2LTMyMC44NmwtMzkyLjA3LTIzMS42M3oiIGZpbGw9IiM4YzhjOGMiLz48cGF0aCBkPSJtMzkyLjA3IDg4Mi4yOSAzOTIuMDYtMjMxLjc1LTM5Mi4wNi0xNzguMjF6IiBmaWxsPSIjMTQxNDE0Ii8+PHBhdGggZD0ibTAgNjUwLjU0IDM5Mi4wNyAyMzEuNzV2LTQwOS45NnoiIGZpbGw9IiMzOTM5MzkiLz48L2c+PC9zdmc+';

    get name() {
        return this.#name;
    }

    get icon() {
        return this.#icon;
    }

    constructor() {
        super([new SignerEthereumWalletAccount({ chain: CHAIN_ETHEREUM })]);
    }
}

export type EthereumWalletChain = typeof CHAIN_ETHEREUM;

export type EthereumWalletAccount = SignerEthereumWalletAccount;

export class SignerEthereumWalletAccount implements WalletAccount {
    #chain: string;
    #features: WalletAccountFeature<this>;
    #wallet: ethers.Wallet;
    #signingKey: ethers.utils.SigningKey;
    #address: Uint8Array;
    #publicKey: Uint8Array;
    #secretKey: Uint8Array;

    get address() {
        return this.#address.slice();
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
            ciphers: [CIPHER_x25519_xsalsa20_poly1305],
            encrypt: (...args) => this.#encrypt(...args),
        },
        decrypt: {
            ciphers: [CIPHER_x25519_xsalsa20_poly1305],
            decrypt: (...args) => this.#decrypt(...args),
        },
    };

    constructor({
        chain,
        features,
    }: {
        chain: EthereumWalletChain;
        features?: AllWalletAccountFeatureNames<SignerEthereumWalletAccount>[];
    }) {
        this.#chain = chain;
        this.#features = features ? pick(this.#allFeatures, ...features) : this.#allFeatures;
        this.#wallet = ethers.Wallet.createRandom();
        this.#address = ethers.utils.arrayify(this.#wallet.address);
        this.#publicKey = ethers.utils.arrayify(this.#wallet.publicKey);
        this.#secretKey = ethers.utils.arrayify(this.#wallet.privateKey);
        this.#signingKey = new ethers.utils.SigningKey(this.#wallet.privateKey);
    }

    async #signTransaction(inputs: SignTransactionInputs<this>): Promise<SignTransactionOutputs<this>> {
        if (!('signTransaction' in this.#features)) throw new Error('signTransaction not authorized');
        if (inputs.some((input) => !!input.extraSigners?.length)) throw new Error('extraSigners not implemented');

        const outputs: SignTransactionOutput<this>[] = [];
        for (const { transaction } of inputs) {
            const parsedTransaction = ethers.utils.parseTransaction(transaction);

            const signedTransaction = await this.#wallet.signTransaction({
                ...parsedTransaction,
                // HACK: signTransaction expects a `number` or `undefined`, not `null`
                type: parsedTransaction.type ?? undefined,
            });

            outputs.push({ signedTransaction: ethers.utils.arrayify(signedTransaction) });
        }

        return outputs;
    }

    async #signTransactionOnly(inputs: SignTransactionOnlyInputs<this>): Promise<SignTransactionOnlyOutputs<this>> {
        if (!('signTransactionOnly' in this.#features)) throw new Error('signTransactionOnly not authorized');
        if (inputs.some((input) => !!input.extraSigners?.length)) throw new Error('extraSigners not implemented');

        const outputs: SignTransactionOnlyOutput<this>[] = [];
        for (const { transaction } of inputs) {
            const parsedTransaction = ethers.utils.parseTransaction(transaction);

            const serializedTransaction = await this.#wallet.signTransaction({
                ...parsedTransaction,
                // HACK: signTransaction expects a `number` or `undefined`, not `null`
                type: parsedTransaction.type ?? undefined,
            });

            const signedTransaction = ethers.utils.parseTransaction(serializedTransaction);

            const signature = ethers.utils.joinSignature({
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                r: signedTransaction.r!,
                s: signedTransaction.s,
                v: signedTransaction.v,
            });

            outputs.push({ signatures: [ethers.utils.arrayify(signature)] });
        }

        return outputs;
    }

    async #signAndSendTransaction(
        inputs: SignAndSendTransactionInputs<this>
    ): Promise<SignAndSendTransactionOutputs<this>> {
        if (!('signAndSendTransaction' in this.#features)) throw new Error('signAndSendTransaction not authorized');
        if (inputs.some((input) => !!input.extraSigners?.length)) throw new Error('extraSigners not implemented');

        // homestead == Ethereum Mainnet
        const wallet = this.#wallet.connect(ethers.getDefaultProvider('homestead'));

        const outputs: SignAndSendTransactionOutput<this>[] = [];
        for (const { transaction } of inputs) {
            const parsedTransaction = ethers.utils.parseTransaction(transaction);

            const { hash } = await wallet.sendTransaction({
                ...parsedTransaction,
                // HACK: signTransaction expects a `number` or `undefined`, not `null`
                type: parsedTransaction.type ?? undefined,
            });

            outputs.push({ signature: ethers.utils.arrayify(hash) });
        }

        return outputs;
    }

    async #signMessage(inputs: SignMessageInputs<this>): Promise<SignMessageOutputs<this>> {
        if (!('signMessage' in this.#features)) throw new Error('signMessage not authorized');
        if (inputs.some((input) => !!input.extraSigners?.length)) throw new Error('extraSigners not implemented');

        const outputs: SignMessageOutput<this>[] = [];
        for (const { message } of inputs) {
            const signature = await this.#wallet.signMessage(message);
            outputs.push({
                signedMessage: ethers.utils.arrayify(ethers.utils.hashMessage(message)),
                signatures: [ethers.utils.arrayify(signature)],
            });
        }

        return outputs;
    }

    async #encrypt(inputs: EncryptInputs<this>): Promise<EncryptOutputs<this>> {
        if (!('encrypt' in this.#features)) throw new Error('encrypt not authorized');
        if (inputs.some((input) => input.cipher && input.cipher !== CIPHER_x25519_xsalsa20_poly1305))
            throw new Error('cipher not supported');

        const outputs: EncryptOutput<this>[] = [];
        for (const { publicKey, cleartext } of inputs) {
            const nonce = randomBytes(32);
            const ciphertext = box(cleartext, nonce, publicKey, this.#secretKey);
            outputs.push({ ciphertext, nonce, cipher: CIPHER_x25519_xsalsa20_poly1305 });
        }

        return outputs;
    }

    async #decrypt(inputs: DecryptInputs<this>): Promise<DecryptOutputs<this>> {
        if (!('decrypt' in this.#features)) throw new Error('decrypt not authorized');
        if (inputs.some((input) => input.cipher && input.cipher !== CIPHER_x25519_xsalsa20_poly1305))
            throw new Error('cipher not supported');

        const outputs: DecryptOutput<this>[] = [];
        for (const { publicKey, ciphertext, nonce } of inputs) {
            const cleartext = box.open(ciphertext, nonce, publicKey, this.#secretKey);
            if (!cleartext) throw new Error('message authentication failed');
            outputs.push({ cleartext });
        }

        return outputs;
    }
}
