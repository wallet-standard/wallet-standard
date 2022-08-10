import { WalletAccount } from '../wallet';
import { SignTransactionOnlyFeature } from './signTransactionOnly';

/** TODO: docs */
export type SignAndSendTransactionFeature<Account extends WalletAccount> = Readonly<{
    signAndSendTransaction: {
        /**
         * Sign transactions using the account's secret key and send them to the chain.
         *
         * @param inputs Inputs for signing and sending transactions.
         *
         * @return Outputs of signing and sending transactions.
         */
        signAndSendTransaction(
            inputs: SignAndSendTransactionInputs<Account>
        ): Promise<SignAndSendTransactionOutputs<Account>>;
    };
}>;

/** Input for signing and sending transactions. */
export type SignAndSendTransactionInput<Account extends WalletAccount> = Readonly<{
    /** Serialized transaction, as raw bytes. */
    transaction: Uint8Array;

    /** Optional accounts that must also sign the transactions. They must have the `signTransactionOnly` feature. */
    extraSigners?: ReadonlyArray<Account & { features: SignTransactionOnlyFeature<Account> }>;

    // TODO: figure out if options for sending need to be supported
}>;

/** Inputs for signing and sending transactions. */
export type SignAndSendTransactionInputs<Account extends WalletAccount> = ReadonlyArray<
    SignAndSendTransactionInput<Account>
>;

/** Output of signing and sending transactions. */
export type SignAndSendTransactionOutput<Account extends WalletAccount> = Readonly<{
    /** Transaction signature, as raw bytes. */
    signature: Uint8Array;
}>;

/** Outputs of signing and sending transactions. */
export type SignAndSendTransactionOutputs<Account extends WalletAccount> = ReadonlyArray<
    SignAndSendTransactionOutput<Account>
>;
