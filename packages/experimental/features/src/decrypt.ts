import type { ReadonlyUint8Array, WalletAccount } from '@wallet-standard/base';

/** TODO: docs */
export type DecryptFeature = {
    /** Name of the feature. */
    'experimental:decrypt': {
        /** Version of the feature implemented by the {@link "@wallet-standard/base".Wallet}. */
        version: DecryptVersion;

        /** List of ciphers supported for decryption. */
        ciphers: readonly string[];

        /**
         * Decrypt ciphertexts using the account's secret key.
         *
         * @param inputs Inputs for decryption.
         *
         * @return Outputs of decryption.
         */
        decrypt: DecryptMethod;
    };
};

/** TODO: docs */
export type DecryptVersion = '1.0.0';

/** TODO: docs */
export type DecryptMethod = (...inputs: DecryptInput[]) => Promise<DecryptOutput[]>;

/** Input for decryption. */
export interface DecryptInput {
    /** Account to use. */
    account: WalletAccount;

    /** Cipher to use for decryption. */
    cipher: string;

    /** Public key to derive a shared key to decrypt the data using. */
    publicKey: ReadonlyUint8Array;

    /** Ciphertext to decrypt. */
    ciphertext: ReadonlyUint8Array;

    /** Nonce to use for decryption. */
    nonce: ReadonlyUint8Array;

    /** Multiple of padding bytes to use for decryption, defaulting to 0. */
    padding?: 0 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048;
}

/** Output of decryption. */
export interface DecryptOutput {
    /** Cleartext that was decrypted. */
    cleartext: Uint8Array;
}
