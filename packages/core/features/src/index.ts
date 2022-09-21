import type { IdentifierRecord, Wallet } from '@wallet-standard/standard';
import type { ConnectFeature } from './connect.js';
import type { DecryptFeature } from './decrypt.js';
import type { EncryptFeature } from './encrypt.js';
import type { SignAndSendTransactionFeature } from './signAndSendTransaction.js';
import type { SignMessageFeature } from './signMessage.js';
import type { SignTransactionFeature } from './signTransaction.js';
import type { SolanaSignAndSendTransactionFeature } from './solanaSignAndSendTransaction.js';
import type { SolanaSignTransactionFeature } from './solanaSignTransaction.js';

/** TODO: docs */
export type StandardFeatures =
    | ConnectFeature
    | DecryptFeature
    | EncryptFeature
    | SignAndSendTransactionFeature
    | SignMessageFeature
    | SignTransactionFeature
    | SolanaSignTransactionFeature
    | SolanaSignAndSendTransactionFeature;

/** TODO: docs */
export type WalletWithFeatures<Features extends IdentifierRecord<unknown>> = Omit<Wallet, 'features'> & {
    features: Features;
};

/** TODO: docs */
export type WalletWithStandardFeatures = WalletWithFeatures<StandardFeatures>;

export * from './connect.js';
export * from './decrypt.js';
export * from './encrypt.js';
export * from './signAndSendTransaction.js';
export * from './signMessage.js';
export * from './signTransaction.js';
export * from './solanaSignTransaction.js';
export * from './solanaSignAndSendTransaction.js';
