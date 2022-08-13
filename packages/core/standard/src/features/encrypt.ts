import type { AsyncMapFunction } from '@wallet-standard/types';

// Instantiation expression -- https://github.com/microsoft/TypeScript/pull/47607
declare const encryptMethod: AsyncMapFunction<EncryptInput, EncryptOutput>;

/** TODO: docs */
export type EncryptMethod = typeof encryptMethod;

/** TODO: docs */
export type EncryptFeature = Readonly<{
    /** Namespace for the feature. */
    encrypt: {
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
}>;

/** Input for encryption. */
export type EncryptInput = Readonly<{
    /** Cipher to use for encryption. */
    cipher: string; // TODO: determine if this needs to be inferred from EncryptFeature

    /** Public key to derive a shared key to encrypt the data using. */
    publicKey: Uint8Array;

    /** Cleartext to decrypt. */
    cleartext: Uint8Array;

    /** Multiple of padding bytes to use for encryption, defaulting to 0. */
    padding?: 0 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048;
}>;

/** Output of encryption. */
export type EncryptOutput = Readonly<{
    /** Ciphertext that was encrypted. */
    ciphertext: Uint8Array;

    /** Nonce that was used for encryption. */
    nonce: Uint8Array;
}>;
