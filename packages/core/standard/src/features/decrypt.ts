/** TODO: docs */
export type DecryptFeature = Readonly<{
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
        decrypt(inputs: DecryptInputs): Promise<DecryptOutputs>;
    };
}>;

/** Input for decryption. */
export type DecryptInput = Readonly<{
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
export type DecryptInputs = ReadonlyArray<DecryptInput>;

/** Output of decryption. */
export type DecryptOutput = Readonly<{
    /** Cleartext that was decrypted. */
    cleartext: Uint8Array;
}>;

/** Outputs of decryption. */
export type DecryptOutputs = ReadonlyArray<DecryptOutput>;
