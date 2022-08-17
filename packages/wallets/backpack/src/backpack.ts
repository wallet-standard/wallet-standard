import type {
    ConfirmOptions,
    Connection,
    PublicKey,
    SendOptions,
    Signer,
    Transaction,
    TransactionSignature,
} from '@solana/web3.js';
import type { JSONRPCClient, WSJSONRPCClient } from '@wallet-standard/standard';

export interface BackpackWindow extends Window {
    backpack: Backpack;
}

export interface BackpackEvents {
    connect(): void;
    disconnect(): void;
    connectionDidChange(): void;
}

export interface Backpack {
    isConnected: boolean;
    publicKey: PublicKey | undefined;
    connection: Connection & { _rpcClient: JSONRPCClient; _rpcWebSocket: WSJSONRPCClient };
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendAndConfirm(
        tx: Transaction,
        signers?: Signer[],
        options?: ConfirmOptions,
        connection?: Connection,
        publicKey?: PublicKey
    ): Promise<TransactionSignature>;
    send(
        tx: Transaction,
        signers?: Signer[],
        options?: SendOptions,
        connection?: Connection,
        publicKey?: PublicKey
    ): Promise<TransactionSignature>;
    signTransaction(tx: Transaction, publicKey?: PublicKey): Promise<Transaction>;
    signAllTransactions(txs: Array<Transaction>, publicKey?: PublicKey): Promise<Array<Transaction>>;
    signMessage(msg: Uint8Array, publicKey?: PublicKey): Promise<Uint8Array>;

    on<E extends keyof BackpackEvents>(event: E, listener: BackpackEvents[E], context: any): void;
    off<E extends keyof BackpackEvents>(event: E, listener: BackpackEvents[E], context: any): void;
}
