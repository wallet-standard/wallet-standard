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
         * @return Result of encryption.
         */
        encrypt(inputs: ReadonlyArray<EncryptInput<Account>>): Promise<ReadonlyArray<EncryptOutput<Account>>>;
    };
}>;

/** Input for encryption. */
export type EncryptInput<Account extends WalletAccount> = Readonly<{
    /** Public key to derive a shared key to encrypt the data using. */
    publicKey: Uint8Array;

    /** Cleartexts to decrypt. */
    cleartexts: ReadonlyArray<Uint8Array>;

    /** Optional cipher to use for encryption. Default to whatever the wallet wants. */
    cipher?: string; // TODO: determine if this needs to be inferred from EncryptFeature

    // TODO: decide if padding is needed
}>;

/** Output of encryption. */
export type EncryptOutput<Account extends WalletAccount> = Readonly<{
    /** Ciphertexts that were encrypted, corresponding with the cleartexts provided. */
    ciphertexts: ReadonlyArray<Uint8Array>;

    /** Nonces that were used for encryption, corresponding with each ciphertext. */
    nonces: ReadonlyArray<Uint8Array>;

    /** Cipher that was used for encryption. */
    cipher?: string; // TODO: determine if this needs to be inferred from EncryptFeature
}>;
