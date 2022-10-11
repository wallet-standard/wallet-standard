import type { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';

export interface SolflareEvent {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
}

export interface SolflareEventEmitter {
    on<E extends keyof SolflareEvent>(event: E, listener: SolflareEvent[E], context?: any): void;
    off<E extends keyof SolflareEvent>(event: E, listener: SolflareEvent[E], context?: any): void;
}

export interface WindowSolflare extends SolflareEventEmitter {
    publicKey: PublicKey | null;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
    signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
    signMessage(message: Uint8Array): Promise<Uint8Array>;
}

export interface SolflareWindow extends Window {
    solflare: WindowSolflare;
}
