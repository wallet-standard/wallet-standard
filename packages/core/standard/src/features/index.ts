import { UnionToIntersection } from '../typescript';
import { WalletAccount } from '../wallet';
import { DecryptFeature } from './decrypt';
import { EncryptFeature } from './encrypt';
import { SignAndSendTransactionFeature } from './signAndSendTransaction';
import { SignMessageFeature } from './signMessage';
import { SignTransactionFeature } from './signTransaction';
import { SignTransactionOnlyFeature } from './signTransactionOnly';

export * from './decrypt';
export * from './encrypt';
export * from './signAndSendTransaction';
export * from './signMessage';
export * from './signTransaction';
export * from './signTransactionOnly';

/** TODO: docs */
export type WalletAccountFeature<Account extends WalletAccount> =
    | SignTransactionFeature<Account>
    | SignTransactionOnlyFeature<Account>
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
