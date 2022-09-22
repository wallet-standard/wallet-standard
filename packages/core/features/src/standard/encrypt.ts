import type { WalletAccount } from '@wallet-standard/standard';
import type { AsyncMapFunction } from '@wallet-standard/types';

/** TODO: docs */
export type EncryptVersion = '1.0.0';

/**
 * TODO: docs
 * Instantiation expression -- https://github.com/microsoft/TypeScript/pull/47607
 */
export declare const encryptMethod: AsyncMapFunction<EncryptInput, EncryptOutput>;

/** TODO: docs */
export type EncryptMethod = typeof encryptMethod;

/** TODO: docs */
export type EncryptFeature = {
    /** Namespace for the feature. */
    'standard:encrypt': {
        /** Version of the feature API. */
        version: EncryptVersion;

        // TODO: consider declaring cipher string types
        /** List of ciphers supported for encryption. */
        ciphers: ReadonlyArray<string>;

        /**
         * Encrypt cleartexts using the account's secret key.
         *
         * @param inputs Inputs for encryption.
         *
         * @return Outputs of encryption.
         */
        encrypt: EncryptMethod;
    };
};

/** Input for encryption. */
export interface EncryptInput {
    /** Account to use. */
    account: WalletAccount;

    /** Cipher to use for encryption. */
    cipher: string;

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
