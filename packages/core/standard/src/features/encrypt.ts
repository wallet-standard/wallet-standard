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
    /** Public key to derive a shared key to encrypt the data using. */
    publicKey: Uint8Array;

    /** Cleartext to decrypt. */
    cleartext: Uint8Array;

    /** Optional cipher to use for encryption. Default to whatever the wallet wants. */
    cipher?: string; // TODO: determine if this needs to be inferred from EncryptFeature
}>;

/** Inputs for encryption. */
export type EncryptInputs = ReadonlyArray<EncryptInput>;

/** Output of encryption. */
export type EncryptOutput = Readonly<{
    /** Ciphertext that was encrypted. */
    ciphertext: Uint8Array;

    /** Nonce that was used for encryption. */
    nonce: Uint8Array;

    /** Cipher that was used for encryption. */
    cipher?: string; // TODO: determine if this needs to be inferred from EncryptFeature
}>;

/** Outputs of encryption. */
export type EncryptOutputs = ReadonlyArray<EncryptOutput>;
