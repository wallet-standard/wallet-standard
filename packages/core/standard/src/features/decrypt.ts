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
         * @return Outputs of decryption.
         */
        decrypt(inputs: DecryptInputs<Account>): Promise<DecryptOutputs<Account>>;
    };
}>;

/** Input for decryption. */
export type DecryptInput<Account extends WalletAccount> = Readonly<{
    /** Public key to derive a shared key to decrypt the data using. */
    publicKey: Uint8Array;

    /** Ciphertext to decrypt. */
    ciphertext: Uint8Array;

    /** Nonce to use for decryption. */
    nonce: Uint8Array;

    /** Cipher to use for decryption. */
    cipher: string; // TODO: determine if this needs to be inferred from DecryptFeature
}>;

/** Inputs for decryption. */
export type DecryptInputs<Account extends WalletAccount> = ReadonlyArray<DecryptInput<Account>>;

/** Output of decryption. */
export type DecryptOutput<Account extends WalletAccount> = Readonly<{
    /** Cleartext that was decrypted. */
    cleartext: Uint8Array;
}>;

/** Outputs of decryption. */
export type DecryptOutputs<Account extends WalletAccount> = ReadonlyArray<DecryptOutput<Account>>;
