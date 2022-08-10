import { WalletAccount } from '../wallet';

/** TODO: docs */
export type SignMessageFeature<Account extends WalletAccount> = Readonly<{
    signMessage: {
        /**
         * Sign messages (arbitrary bytes) using the account's secret key.
         *
         * @param inputs Inputs for signing messages.
         *
         * @return Outputs of signing messages.
         */
        signMessage(inputs: SignMessageInputs<Account>): Promise<SignMessageOutputs<Account>>;
    };
}>;

/** Input for signing a message. */
export type SignMessageInput<Account extends WalletAccount> = Readonly<{
    /** Message to sign, as raw bytes. */
    message: Uint8Array;

    /** Optional accounts that must also sign the messages. They must have the `signMessage` feature. */
    extraSigners?: ReadonlyArray<Account & { features: SignMessageFeature<Account> }>;
}>;

/** Inputs for signing messages. */
export type SignMessageInputs<Account extends WalletAccount> = ReadonlyArray<SignMessageInput<Account>>;

/** Output of signing a message. */
export type SignMessageOutput<Account extends WalletAccount> = Readonly<{
    /** TODO: docs */
    signedMessage: Uint8Array;

    /** TODO: docs */
    signatures: ReadonlyArray<Uint8Array>;
}>;

/** Outputs of signing messages. */
export type SignMessageOutputs<Account extends WalletAccount> = ReadonlyArray<SignMessageOutput<Account>>;
