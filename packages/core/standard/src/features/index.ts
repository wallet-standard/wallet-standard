import type { UnionToIntersection } from '@wallet-standard/types';
import { WalletAccount } from '../wallet';
import { DecryptFeature } from './decrypt';
import { EncryptFeature } from './encrypt';
import { JSONRPCFeature } from './JSONRPC';
import { SignAndSendTransactionFeature } from './signAndSendTransaction';
import { SignMessageFeature } from './signMessage';
import { SignTransactionFeature } from './signTransaction';
import { SolanaFeature } from './solana';
import { WSJSONRPCFeature } from './WSJSONRPC';

export * from './decrypt';
export * from './encrypt';
export * from './signAndSendTransaction';
export * from './signMessage';
export * from './signTransaction';

/** TODO: docs */
export type Feature =
    | SignTransactionFeature
    | SignAndSendTransactionFeature
    | SignMessageFeature
    | EncryptFeature
    | DecryptFeature
    | SolanaFeature
    | JSONRPCFeature
    | WSJSONRPCFeature;

/** TODO: docs */
export type WalletAccountFeatures<Account extends WalletAccount> = UnionToIntersection<Account['features']>;

/** TODO: docs */
export type WalletAccountFeatureName<Account extends WalletAccount> = keyof WalletAccountFeatures<Account>;

/** TODO: docs */
export type WalletAccountExtensions<Account extends WalletAccount> = UnionToIntersection<Account['extensions']>;

/** TODO: docs */
export type WalletAccountExtensionName<Account extends WalletAccount> = keyof WalletAccountExtensions<Account>;
