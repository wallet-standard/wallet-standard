/** TODO: docs */
export type EncryptFeature = Readonly<{
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
        encrypt(inputs: EncryptInputs): Promise<EncryptOutputs>;
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
    padding?: 0 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048;
}>;

/** Inputs for encryption. */
export type EncryptInputs = ReadonlyArray<EncryptInput>;

/** Output of encryption. */
export type EncryptOutput = Readonly<{
    /** Ciphertext that was encrypted. */
    ciphertext: Uint8Array;

    /** Nonce that was used for encryption. */
    nonce: Uint8Array;
}>;

/** Outputs of encryption. */
export type EncryptOutputs = ReadonlyArray<EncryptOutput>;
