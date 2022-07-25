import { UnionToIntersection } from './util';
import { Bytes, WalletAccount } from './wallet';

/** TODO: docs */
export type WalletAccountMethod<Account extends WalletAccount> =
    | SignTransactionMethod
    | SignAndSendTransactionMethod
    | SignMessageMethod
    | EncryptMethod<Account>
    | DecryptMethod<Account>;

/** TODO: docs */
export type WalletAccountMethods<Account extends WalletAccount> = UnionToIntersection<Account['methods']>;

/** TODO: docs */
export type WalletAccountMethodNames<Account extends WalletAccount> = keyof WalletAccountMethods<Account>;

/** TODO: docs */
export type AllWalletAccountMethods<Account extends WalletAccount> = UnionToIntersection<WalletAccountMethod<Account>>;

/** TODO: docs */
export type AllWalletAccountMethodNames<Account extends WalletAccount> = keyof AllWalletAccountMethods<Account>;

/** TODO: docs */
export interface SignTransactionMethod {
    /**
     * Sign transactions using the account's secret key.
     * The transactions may already be partially signed, and may even have a "primary" signature.
     * This method covers existing `signTransaction` and `signAllTransactions` functionality, matching the SMS Mobile Wallet Adapter SDK.
     *
     * @param input Input for signing transactions.
     *
     * @return Output of signing transactions.
     */
    signTransaction(input: SignTransactionInput): Promise<SignTransactionOutput>;
}

/** Input for signing transactions. */
export interface SignTransactionInput {
    /** Serialized transactions, as raw bytes. */
    transactions: Bytes[];
}

/** Result of signing transactions. */
export interface SignTransactionOutput {
    /**
     * Signed, serialized transactions, as raw bytes.
     * Return transactions rather than signatures allows multisig wallets, program wallets, and other wallets that use
     * meta-transactions to return a modified, signed transaction.
     */
    signedTransactions: Bytes[];
}

/** TODO: docs */
export interface SignAndSendTransactionMethod {
    /**
     * Sign transactions using the account's secret key and send them to the network.
     * The transactions may already be partially signed, and may even have a "primary" signature.
     * This method covers existing `signAndSendTransaction` functionality, and also provides an `All` version of the same, matching the SMS Mobile Wallet Adapter SDK.
     *
     * @param input Input for signing and sending transactions.
     *
     * @return Output of signing and sending transactions.
     */
    signAndSendTransaction(input: SignAndSendTransactionInput): Promise<SignAndSendTransactionOutput>;
}

/** Input for signing and sending transactions. */
export interface SignAndSendTransactionInput {
    /** Serialized transactions, as raw bytes. */
    transactions: Bytes[];
    // TODO: figure out if options for sending need to be supported
}

/** Output of signing and sending transactions. */
export interface SignAndSendTransactionOutput {
    /** "Primary" transaction signatures, as raw bytes. */
    signatures: Bytes[];
}

/** TODO: docs */
export interface SignMessageMethod {
    /**
     * Sign messages (arbitrary bytes) using the account's secret key.
     *
     * @param input Input for signing messages.
     *
     * @return Output of signing messages.
     */
    signMessage(input: SignMessageInput): Promise<SignMessageOutput>;
}

/** Input for signing messages. */
export interface SignMessageInput {
    /** Messages to sign, as raw bytes. */
    messages: Bytes[];
}

/** Output of signing one or messages. */
export interface SignMessageOutput {
    /** Message signatures, as raw bytes. */
    signatures: Bytes[];
}

/** TODO: docs */
export interface EncryptMethod<Account extends WalletAccount> {
    /**
     * Encrypt cleartexts using the account's secret key.
     *
     * @param inputs Inputs for encryption.
     *
     * @return Result of encryption.
     */
    encrypt(inputs: EncryptInput<Account>[]): Promise<EncryptOutput<Account>[]>;
}

/** Input for encryption. */
export interface EncryptInput<Account extends WalletAccount> {
    /** Public key to derive a shared key to encrypt the data using. */
    publicKey: Bytes;

    /** Cleartexts to decrypt. */
    cleartexts: Bytes[];

    /** Optional cipher to use for encryption. Default to whatever the wallet wants. */
    cipher?: Account['ciphers'][number];
}

/** Output of encryption. */
export interface EncryptOutput<Account extends WalletAccount> {
    /** Ciphertexts that were encrypted, corresponding with the cleartexts provided. */
    ciphertexts: Bytes[];

    /** Nonces that were used for encryption, corresponding with each ciphertext. */
    nonces: Bytes[];

    /** Cipher that was used for encryption. */
    cipher: Account['ciphers'][number];
}

/** TODO: docs */
export interface DecryptMethod<Account extends WalletAccount> {
    /**
     * Decrypt ciphertexts using the account's secret key.
     *
     * @param inputs Inputs for decryption.
     *
     * @return Result of decryption.
     */
    decrypt(inputs: DecryptInput<Account>[]): Promise<DecryptOutput[]>;
}

/** Input for decryption. */
export interface DecryptInput<Account extends WalletAccount> {
    /** Public key to derive a shared key to decrypt the data using. */
    publicKey: Bytes;

    /** Ciphertexts to decrypt. */
    ciphertexts: Bytes[];

    /** Nonces to use for decryption, corresponding with each ciphertext. */
    nonces: Bytes[];

    /** Cipher to use for decryption. */
    cipher: Account['ciphers'][number];
}

/** Output of decryption. */
export interface DecryptOutput {
    /** Cleartexts that were decrypted, corresponding with the ciphertexts provided. */
    cleartexts: Bytes[];
}
