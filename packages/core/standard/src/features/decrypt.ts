import { WalletAccount } from '../wallet';

/** TODO: docs */
export type DecryptFeature<Account extends WalletAccount> = Readonly<{
    decrypt: {
        /** List of ciphers supported for decryption. */
        ciphers: ReadonlyArray<string>;

        /**
         * Decrypt ciphertexts using the account's secret key.
         *
         * @param inputs Inputs for decryption.
         *
         * @return Result of decryption.
         */
        decrypt(inputs: ReadonlyArray<DecryptInput<Account>>): Promise<ReadonlyArray<DecryptOutput<Account>>>;
    };
}>;

/** Input for decryption. */
export type DecryptInput<Account extends WalletAccount> = Readonly<{
    /** Public key to derive a shared key to decrypt the data using. */
    publicKey: Uint8Array;

    /** Ciphertexts to decrypt. */
    ciphertexts: ReadonlyArray<Uint8Array>;

    /** Nonces to use for decryption, corresponding with each ciphertext. */
    nonces: ReadonlyArray<Uint8Array>;

    /** Cipher to use for decryption. */
    cipher: string; // TODO: determine if this needs to be inferred from DecryptFeature

    // TODO: decide if padding is needed
}>;

/** Output of decryption. */
export type DecryptOutput<Account extends WalletAccount> = Readonly<{
    /** Cleartexts that were decrypted, corresponding with the ciphertexts provided. */
    cleartexts: ReadonlyArray<Uint8Array>;
}>;
