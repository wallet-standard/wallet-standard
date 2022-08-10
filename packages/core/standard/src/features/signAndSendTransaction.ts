import { WalletAccount } from '../wallet';
import { SignTransactionOnlyFeature } from './signTransactionOnly';

/** TODO: docs */
export type SignAndSendTransactionFeature = Readonly<{
    signAndSendTransaction: {
        /**
         * Sign transactions using the account's secret key and send them to the chain.
         *
         * @param inputs Inputs for signing and sending transactions.
         *
         * @return Outputs of signing and sending transactions.
         */
        signAndSendTransaction(inputs: SignAndSendTransactionInputs): Promise<SignAndSendTransactionOutputs>;
    };
}>;

/** Input for signing and sending transactions. */
export type SignAndSendTransactionInput = Readonly<{
    /** Serialized transaction, as raw bytes. */
    transaction: Uint8Array;

    /** Optional accounts that must also sign the transactions. They must have the `signTransactionOnly` feature. */
    extraSigners?: ReadonlyArray<WalletAccount & { features: SignTransactionOnlyFeature }>;

    // TODO: figure out if options for sending need to be supported
}>;

/** Inputs for signing and sending transactions. */
export type SignAndSendTransactionInputs = ReadonlyArray<SignAndSendTransactionInput>;

/** Output of signing and sending transactions. */
export type SignAndSendTransactionOutput = Readonly<{
    /** Transaction signature, as raw bytes. */
    signature: Uint8Array;
}>;

/** Outputs of signing and sending transactions. */
export type SignAndSendTransactionOutputs = ReadonlyArray<SignAndSendTransactionOutput>;
