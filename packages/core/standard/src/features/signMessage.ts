import { WalletAccount } from '../wallet';

/** TODO: docs */
export type SignMessageFeature = Readonly<{
    signMessage: {
        /**
         * Sign messages (arbitrary bytes) using the account's secret key.
         *
         * @param inputs Inputs for signing messages.
         *
         * @return Outputs of signing messages.
         */
        signMessage(inputs: SignMessageInputs): Promise<SignMessageOutputs>;
    };
}>;

/** Input for signing a message. */
export type SignMessageInput = Readonly<{
    /** Message to sign, as raw bytes. */
    message: Uint8Array;

    /** Optional accounts that must also sign the messages. They must have the `signMessage` feature. */
    extraSigners?: ReadonlyArray<WalletAccount & { features: SignMessageFeature }>;
}>;

/** Inputs for signing messages. */
export type SignMessageInputs = ReadonlyArray<SignMessageInput>;

/** Output of signing a message. */
export type SignMessageOutput = Readonly<{
    /** TODO: docs */
    signedMessage: Uint8Array;

    /** TODO: docs */
    signatures: ReadonlyArray<Uint8Array>;
}>;

/** Outputs of signing messages. */
export type SignMessageOutputs = ReadonlyArray<SignMessageOutput>;
