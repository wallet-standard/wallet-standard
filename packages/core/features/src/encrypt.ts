import type { WalletAccount } from '@wallet-standard/standard';
import type { AsyncMapFunction } from '@wallet-standard/types';

/**
 * TODO: docs
 * Instantiation expression -- https://github.com/microsoft/TypeScript/pull/47607
 */
export declare const encryptMethod: AsyncMapFunction<EncryptInput, EncryptOutput>;

/** TODO: docs */
export type EncryptMethod = typeof encryptMethod;

/** TODO: docs */
export interface EncryptFeature {
    /** Namespace for the feature. */
    encrypt: {
        /** Version of the feature API. */
        version: '1.0.0';

        /** List of ciphers supported for encryption. */
        ciphers: string[];

        /**
         * Encrypt cleartexts using the account's secret key.
         *
         * @param inputs Inputs for encryption.
         *
         * @return Outputs of encryption.
         */
        encrypt: EncryptMethod;
    };
}

/** Input for encryption. */
export interface EncryptInput<Chain extends string = string> {
    /** Account to use. */
    account: WalletAccount<Chain, 'encrypt'>;

    /** Chain to use. */
    chain: Chain;

    /** Cipher to use for encryption. */
    cipher: string; // TODO: determine if this needs to be inferred from EncryptFeature

    /** Public key to derive a shared key to encrypt the data using. */
    publicKey: Uint8Array;

    /** Cleartext to decrypt. */
    cleartext: Uint8Array;

    /** Multiple of padding bytes to use for encryption, defaulting to 0. */
    padding?: 0 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048;
}

/** Output of encryption. */
export interface EncryptOutput {
    /** Ciphertext that was encrypted. */
    ciphertext: Uint8Array;

    /** Nonce that was used for encryption. */
    nonce: Uint8Array;
}
