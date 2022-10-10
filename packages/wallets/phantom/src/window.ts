import type { PublicKey, SendOptions, Transaction } from '@solana/web3.js';

export interface PhantomEvent {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
    accountChanged(newPublicKey: PublicKey): unknown;
}

export interface PhantomEventEmitter {
    on<E extends keyof PhantomEvent>(event: E, listener: PhantomEvent[E], context?: any): void;
    off<E extends keyof PhantomEvent>(event: E, listener: PhantomEvent[E], context?: any): void;
}

export interface PhantomSolana extends PhantomEventEmitter {
    publicKey: PublicKey | null;
    isConnected: boolean | null;
    signAndSendTransaction(
        transaction: Transaction,
        options?: SendOptions
    ): Promise<{ signature: string; publicKey: PublicKey }>;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    signMessage(message: Uint8Array | string): Promise<{ signature: Uint8Array }>;
    connect(options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: PublicKey }>;
    disconnect(): Promise<void>;
}

export interface WindowPhantom {
    solana: PhantomSolana;
}

export interface PhantomWindow extends Window {
    phantom: WindowPhantom;
}
