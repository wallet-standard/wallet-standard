import type {
    ConfirmOptions,
    Connection,
    PublicKey,
    SendOptions,
    Signer,
    Transaction,
    TransactionSignature,
    VersionedTransaction,
} from '@solana/web3.js';

export interface BackpackEvent {
    connect(): void;
    disconnect(): void;
    connectionDidChange(): void;
}

export interface BackpackEventEmitter {
    on<E extends keyof BackpackEvent>(event: E, listener: BackpackEvent[E], context?: any): void;
    off<E extends keyof BackpackEvent>(event: E, listener: BackpackEvent[E], context?: any): void;
}

export interface WindowBackpack extends BackpackEventEmitter {
    isConnected: boolean;
    publicKey: PublicKey | undefined;
    connection: Connection;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendAndConfirm<T extends Transaction | VersionedTransaction>(
        tx: T,
        signers?: Signer[],
        options?: ConfirmOptions,
        connection?: Connection,
        publicKey?: PublicKey
    ): Promise<TransactionSignature>;
    send<T extends Transaction | VersionedTransaction>(
        tx: T,
        signers?: Signer[],
        options?: SendOptions,
        connection?: Connection,
        publicKey?: PublicKey
    ): Promise<TransactionSignature>;
    signTransaction<T extends Transaction | VersionedTransaction>(tx: T, publicKey?: PublicKey): Promise<T>;
    signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[], publicKey?: PublicKey): Promise<T[]>;
    signMessage(msg: Uint8Array, publicKey?: PublicKey): Promise<Uint8Array>;
}

export interface BackpackWindow extends Window {
    backpack: WindowBackpack;
}
