import type { WalletAccount } from '@wallet-standard/standard';
import type { AsyncMapFunction } from '@wallet-standard/types';

/** TODO: docs */
export type EncryptMethod<A extends WalletAccount> = AsyncMapFunction<EncryptInput<A>, EncryptOutput<A>>;

/** TODO: docs */
export type EncryptFeature<A extends WalletAccount> = {
    /** Namespace for the feature. */
    encrypt: {
        /** Version of the feature API. */
        version: '1.0.0';

        /** List of ciphers supported for encryption. */
        ciphers: ReadonlyArray<string>;

        /**
         * Encrypt cleartexts using the account's secret key.
         *
         * @param inputs Inputs for encryption.
         *
         * @return Outputs of encryption.
         */
        encrypt: EncryptMethod<A>;
    };
};

/** Input for encryption. */
export type EncryptInput<A extends WalletAccount> = {
    /** Cipher to use for encryption. */
    cipher: string;

    /** Public key to derive a shared key to encrypt the data using. */
    publicKey: Uint8Array;

    /** Cleartext to decrypt. */
    cleartext: Uint8Array;

    /** Multiple of padding bytes to use for encryption, defaulting to 0. */
    padding?: 0 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048;
};

/** Output of encryption. */
export type EncryptOutput<A extends WalletAccount> = {
    /** Ciphertext that was encrypted. */
    ciphertext: Uint8Array;

    /** Nonce that was used for encryption. */
    nonce: Uint8Array;
};
