import type { WalletAccount } from '@wallet-standard/standard';
import type { AsyncMapFunction } from '@wallet-standard/types';

/** TODO: docs */
export type DecryptMethod<A extends WalletAccount> = AsyncMapFunction<DecryptInput<A>, DecryptOutput<A>>;

/** TODO: docs */
export type DecryptFeature<A extends WalletAccount> = {
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
        decrypt: DecryptMethod<A>;
    };
};

/** Input for decryption. */
export type DecryptInput<A extends WalletAccount> = {
    /** Cipher to use for decryption. */
    cipher: string;

    /** Public key to derive a shared key to decrypt the data using. */
    publicKey: Uint8Array;

    /** Ciphertext to decrypt. */
    ciphertext: Uint8Array;

    /** Nonce to use for decryption. */
    nonce: Uint8Array;

    /** Multiple of padding bytes to use for decryption, defaulting to 0. */
    padding?: 0 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048;
};

/** Output of decryption. */
export type DecryptOutput<A extends WalletAccount> = {
    /** Cleartext that was decrypted. */
    cleartext: Uint8Array;
};
