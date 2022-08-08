import { WalletAccount } from '../wallet';

/** TODO: docs */
export type SignMessageFeature<Account extends WalletAccount> = Readonly<{
    signMessage: {
        /**
         * Sign messages (arbitrary bytes) using the account's secret key.
         *
         * @param input Input for signing messages.
         *
         * @return Output of signing messages.
         */
        signMessage(input: SignMessageInput<Account>): Promise<SignMessageOutput<Account>>;
    };
}>;

/** Input for signing messages. */
export type SignMessageInput<Account extends WalletAccount> = Readonly<{
    /** Messages to sign, as raw bytes. */
    messages: ReadonlyArray<Uint8Array>;

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
    signedMessages: ReadonlyArray<Uint8Array>;
}>;
