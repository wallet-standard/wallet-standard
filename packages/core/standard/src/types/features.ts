import { UnionToIntersection } from './util';
import { Bytes, WalletAccount } from './wallet';

/** TODO: docs */
export type WalletAccountFeature<Account extends WalletAccount> =
    | SignTransactionFeature<Account>
    | SignAndSendTransactionFeature<Account>
    | SignMessageFeature<Account>
    | EncryptFeature<Account>
    | DecryptFeature<Account>;

/** TODO: docs */
export type WalletAccountFeatures<Account extends WalletAccount> = UnionToIntersection<Account['features']>;

/** TODO: docs */
export type WalletAccountFeatureNames<Account extends WalletAccount> = keyof WalletAccountFeatures<Account>;

/** TODO: docs */
export type AllWalletAccountFeatures<Account extends WalletAccount> = UnionToIntersection<
    WalletAccountFeature<Account>
>;

/** TODO: docs */
export type AllWalletAccountFeatureNames<Account extends WalletAccount> = keyof AllWalletAccountFeatures<Account>;

/** TODO: docs */
export interface SignTransactionFeature<Account extends WalletAccount> {
    /**
     * Sign transactions using the account's secret key.
     * The transactions may already be partially signed, and may even have a "primary" signature.
     * This feature covers existing `signTransaction` and `signAllTransactions` functionality, matching the SMS Mobile Wallet Adapter SDK.
     *
     * @param input Input for signing transactions.
     *
     * @return Output of signing transactions.
     */
    signTransaction(input: SignTransactionInput<Account>): Promise<SignTransactionOutput<Account>>;
}

/** Input for signing transactions. */
export type SignTransactionInput<Account extends WalletAccount> = Readonly<{
    /** Serialized transactions, as raw bytes. */
    transactions: ReadonlyArray<Bytes>;

    /** Optional accounts that must also sign the transactions. They must have the `signTransaction` feature. */
    extraSigners?: ReadonlyArray<Account & { features: SignTransactionFeature<Account> }>;
}>;

/** Result of signing transactions. */
export type SignTransactionOutput<Account extends WalletAccount> = Readonly<{
    /**
     * Signed, serialized transactions, as raw bytes.
     * Returning transactions rather than signatures allows multisig wallets, program wallets, and other wallets that
     * use meta-transactions to return a modified, signed transaction.
     */
    signedTransactions: ReadonlyArray<Bytes>;
}>;

/** TODO: docs */
export interface SignAndSendTransactionFeature<Account extends WalletAccount> {
    /**
     * Sign transactions using the account's secret key and send them to the network.
     * The transactions may already be partially signed, and may even have a "primary" signature.
     * This feature covers existing `signAndSendTransaction` functionality, and also provides an `All` version of the
     * same, matching the SMS Mobile Wallet Adapter SDK.
     *
     * @param input Input for signing and sending transactions.
     *
     * @return Output of signing and sending transactions.
     */
    signAndSendTransaction(input: SignAndSendTransactionInput<Account>): Promise<SignAndSendTransactionOutput<Account>>;
}

/** Input for signing and sending transactions. */
export type SignAndSendTransactionInput<Account extends WalletAccount> = Readonly<{
    /** Serialized transactions, as raw bytes. */
    transactions: ReadonlyArray<Bytes>;
    // TODO: figure out if options for sending need to be supported

    /** Optional accounts that must also sign the transactions. They must have the `signTransaction` feature. */
    extraSigners?: ReadonlyArray<Account & { features: SignTransactionFeature<Account> }>;
}>;

/** Output of signing and sending transactions. */
export type SignAndSendTransactionOutput<Account extends WalletAccount> = Readonly<{
    /** "Primary" transaction signatures, as raw bytes. */
    signatures: ReadonlyArray<Bytes>;
}>;

/** TODO: docs */
export interface SignMessageFeature<Account extends WalletAccount> {
    /**
     * Sign messages (arbitrary bytes) using the account's secret key.
     *
     * @param input Input for signing messages.
     *
     * @return Output of signing messages.
     */
    signMessage(input: SignMessageInput<Account>): Promise<SignMessageOutput<Account>>;
}

/** Input for signing messages. */
export type SignMessageInput<Account extends WalletAccount> = Readonly<{
    /** Messages to sign, as raw bytes. */
    messages: ReadonlyArray<Bytes>;

    /** Optional accounts that must also sign the messages. They must have the `signMessage` feature. */
    extraSigners?: ReadonlyArray<Account & { features: SignMessageFeature<Account> }>;
}>;

/** Output of signing messages. */
export type SignMessageOutput<Account extends WalletAccount> = Readonly<{
    /**
     * Messages with concatenated signatures, as raw bytes.
     * Returning signed messages rather than signatures allows wallets to prefix messages before signing and return the
     * modified, prefixed messages along with their signatures.
     */
    signedMessages: ReadonlyArray<Bytes>;
}>;

/** TODO: docs */
export interface EncryptFeature<Account extends WalletAccount> {
    /**
     * Encrypt cleartexts using the account's secret key.
     *
     * @param inputs Inputs for encryption.
     *
     * @return Result of encryption.
     */
    encrypt(inputs: ReadonlyArray<EncryptInput<Account>>): Promise<ReadonlyArray<EncryptOutput<Account>>>;
}

/** Input for encryption. */
export type EncryptInput<Account extends WalletAccount> = Readonly<{
    /** Public key to derive a shared key to encrypt the data using. */
    publicKey: Bytes;

    /** Cleartexts to decrypt. */
    cleartexts: ReadonlyArray<Bytes>;

    /** Optional cipher to use for encryption. Default to whatever the wallet wants. */
    cipher?: Account['ciphers'][number];
}>;

/** Output of encryption. */
export type EncryptOutput<Account extends WalletAccount> = Readonly<{
    /** Ciphertexts that were encrypted, corresponding with the cleartexts provided. */
    ciphertexts: ReadonlyArray<Bytes>;

    /** Nonces that were used for encryption, corresponding with each ciphertext. */
    nonces: ReadonlyArray<Bytes>;

    /** Cipher that was used for encryption. */
    cipher: Account['ciphers'][number];
}>;

/** TODO: docs */
export interface DecryptFeature<Account extends WalletAccount> {
    /**
     * Decrypt ciphertexts using the account's secret key.
     *
     * @param inputs Inputs for decryption.
     *
     * @return Result of decryption.
     */
    decrypt(inputs: ReadonlyArray<DecryptInput<Account>>): Promise<ReadonlyArray<DecryptOutput<Account>>>;
}

/** Input for decryption. */
export type DecryptInput<Account extends WalletAccount> = Readonly<{
    /** Public key to derive a shared key to decrypt the data using. */
    publicKey: Bytes;

    /** Ciphertexts to decrypt. */
    ciphertexts: ReadonlyArray<Bytes>;

    /** Nonces to use for decryption, corresponding with each ciphertext. */
    nonces: ReadonlyArray<Bytes>;

    /** Cipher to use for decryption. */
    cipher: Account['ciphers'][number];
}>;

/** Output of decryption. */
export type DecryptOutput<Account extends WalletAccount> = Readonly<{
    /** Cleartexts that were decrypted, corresponding with the ciphertexts provided. */
    cleartexts: ReadonlyArray<Bytes>;
}>;
