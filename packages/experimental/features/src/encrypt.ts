import type { ReadonlyUint8Array, WalletAccount } from '@wallet-standard/base';

/** TODO: docs */
export type EncryptFeature = {
    /** Name of the feature. */
    'experimental:encrypt': {
        /** Version of the feature implemented by the {@link "@wallet-standard/base".Wallet}. */
        version: EncryptVersion;

        // TODO: consider declaring cipher string types
        /** List of ciphers supported for encryption. */
        ciphers: readonly string[];

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

/** TODO: docs */
export type EncryptVersion = '1.0.0';

/** TODO: docs */
export type EncryptMethod = (...inputs: EncryptInput[]) => Promise<EncryptOutput[]>;

/** Input for encryption. */
export interface EncryptInput {
    /** Account to use. */
    account: WalletAccount;

    /** Cipher to use for encryption. */
    cipher: string;

    /** Public key to derive a shared key to encrypt the data using. */
    publicKey: ReadonlyUint8Array;

    /** Cleartext to decrypt. */
    cleartext: ReadonlyUint8Array;

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
