import { WalletAccount } from '../wallet';
import { SignTransactionOnlyFeature } from './signTransactionOnly';

/** TODO: docs */
export type SignAndSendTransactionFeature<Account extends WalletAccount> = Readonly<{
    signAndSendTransaction: {
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
        signAndSendTransaction(
            input: SignAndSendTransactionInput<Account>
        ): Promise<SignAndSendTransactionOutput<Account>>;
    };
}>;

/** Input for signing and sending transactions. */
export type SignAndSendTransactionInput<Account extends WalletAccount> = Readonly<{
    /** Serialized transactions, as raw bytes. */
    transactions: ReadonlyArray<Uint8Array>;
    // TODO: figure out if options for sending need to be supported

    /** Optional accounts that must also sign the transactions. They must have the `signTransactionOnly` feature. */
    extraSigners?: ReadonlyArray<Account & { features: SignTransactionOnlyFeature<Account> }>;
}>;

/** Output of signing and sending transactions. */
export type SignAndSendTransactionOutput<Account extends WalletAccount> = Readonly<{
    /** "Primary" transaction signatures, as raw bytes. */
    signatures: ReadonlyArray<Uint8Array>;
}>;
