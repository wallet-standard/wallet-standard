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
export * from './solana';
export * from './JSONRPC';
export * from './WSJSONRPC';

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
