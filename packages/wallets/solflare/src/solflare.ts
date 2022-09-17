import type { Connection, PublicKey, Transaction } from '@solana/web3.js';

export interface SolflareWindow extends Window {
    solflare: Solflare;
}

export interface SolflareEvents {
    connect(): void;
    disconnect(): void;
    connectionDidChange(): void;
}

export interface Solflare {
    isConnected: boolean;
    publicKey: PublicKey | undefined;
    connection: Connection | undefined;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    signTransaction(tx: Transaction, publicKey?: PublicKey): Promise<Transaction>;
    signAllTransactions(txs: Array<Transaction>, publicKey?: PublicKey): Promise<Array<Transaction>>;
    signMessage(msg: Uint8Array, publicKey?: PublicKey): Promise<Uint8Array>;

    on<E extends keyof SolflareEvents>(event: E, listener: SolflareEvents[E], context: any): void;
    off<E extends keyof SolflareEvents>(event: E, listener: SolflareEvents[E], context: any): void;
    once<E extends keyof SolflareEvents>(event: E, listener: SolflareEvents[E], context: any): void;
}
