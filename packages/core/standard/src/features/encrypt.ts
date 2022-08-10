import { WalletAccount } from '../wallet';

/** TODO: docs */
export type EncryptFeature<Account extends WalletAccount> = Readonly<{
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
        encrypt(inputs: EncryptInputs<Account>): Promise<EncryptOutputs<Account>>;
    };
}>;

/** Input for encryption. */
export type EncryptInput<Account extends WalletAccount> = Readonly<{
    /** Public key to derive a shared key to encrypt the data using. */
    publicKey: Uint8Array;

    /** Cleartext to decrypt. */
    cleartext: Uint8Array;

    /** Optional cipher to use for encryption. Default to whatever the wallet wants. */
    cipher?: string; // TODO: determine if this needs to be inferred from EncryptFeature
}>;

/** Inputs for encryption. */
export type EncryptInputs<Account extends WalletAccount> = ReadonlyArray<EncryptInput<Account>>;

/** Output of encryption. */
export type EncryptOutput<Account extends WalletAccount> = Readonly<{
    /** Ciphertext that was encrypted. */
    ciphertext: Uint8Array;

    /** Nonce that was used for encryption. */
    nonce: Uint8Array;

    /** Cipher that was used for encryption. */
    cipher?: string; // TODO: determine if this needs to be inferred from EncryptFeature
}>;

/** Outputs of encryption. */
export type EncryptOutputs<Account extends WalletAccount> = ReadonlyArray<EncryptOutput<Account>>;
