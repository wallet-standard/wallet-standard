import type { AsyncMapFunction } from '@wallet-standard/types';

/**
 * TODO: docs
 * Instantiation expression -- https://github.com/microsoft/TypeScript/pull/47607
 */
export declare const decryptMethod: AsyncMapFunction<DecryptInput, DecryptOutput>;

/** TODO: docs */
export type DecryptMethod = typeof decryptMethod;

/** TODO: docs */
export type DecryptFeature = Readonly<{
    /** Namespace for the feature. */
    decrypt: {
        /** Version of the feature API. */
        version: '1.0.0';

        /** List of ciphers supported for decryption. */
        ciphers: ReadonlyArray<string>;

        /**
         * Decrypt ciphertexts using the account's secret key.
         *
         * @param inputs Inputs for decryption.
         *
         * @return Outputs of decryption.
         */
        decrypt: DecryptMethod;
    };
}>;

/** Input for decryption. */
export type DecryptInput = Readonly<{
    /** Cipher to use for decryption. */
    cipher: string; // TODO: determine if this needs to be inferred from DecryptFeature

    /** Public key to derive a shared key to decrypt the data using. */
    publicKey: Uint8Array;

    /** Ciphertext to decrypt. */
    ciphertext: Uint8Array;

    /** Nonce to use for decryption. */
    nonce: Uint8Array;

    /** Multiple of padding bytes to use for decryption, defaulting to 0. */
    padding?: 0 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048;
}>;

/** Output of decryption. */
export type DecryptOutput = Readonly<{
    /** Cleartext that was decrypted. */
    cleartext: Uint8Array;
}>;
