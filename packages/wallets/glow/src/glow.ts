import type { PublicKey, Transaction } from '@solana/web3.js';
import EventEmitter from 'eventemitter3';

export enum Network {
    Mainnet = 'mainnet',
    Devnet = 'devnet',
    Localnet = 'localnet',
}

export interface PhantomWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
    accountChanged(publicKey: PublicKey | null): unknown;
}

export interface PhantomAdapter extends EventEmitter<PhantomWalletEvents> {
    // Properties
    publicKey?: { toBytes(): Uint8Array; toBase58(): string } | null;
    isConnected: boolean;

    // Methods
    connect: (params?: { onlyIfTrusted: true }) => Promise<{ publicKey: PublicKey | null }>;
    disconnect: () => Promise<void>;
    signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array | null }>;
    signTransaction: (
        transaction: Transaction,
        // The network parameter is not supported on Phantom
        network?: Network
    ) => Promise<Transaction>;

    signAllTransactions(
        transactions: Transaction[],
        // The network parameter is not supported on Phantom
        network?: Network
    ): Promise<Transaction[]>;
}

export interface GlowAdapter extends EventEmitter<PhantomWalletEvents> {
    signIn: () => Promise<{
        address: string;
        signatureBase64: string;
        message: string;
        signedTransactionBase64?: string; // This is useful for Ledger
    }>;
    connect: (params?: { onlyIfTrusted: true }) => Promise<{
        publicKey: PublicKey;
        address: string;
    }>;
    disconnect: () => Promise<void>;
    signOut: () => Promise<null>;
    signMessage: (params: { messageBase64: string }) => Promise<{ signedMessageBase64: string }>;
    signAndSendTransaction: (params: {
        transactionBase64: string;
        network: Network;
        waitForConfirmation?: boolean;
    }) => Promise<{ signature: string }>;
    signTransaction: (params: {
        transactionBase64: string;
        network: Network;
    }) => Promise<{ signature: string; signedTransactionBase64: string }>;
    signAllTransactions: (params: {
        transactionsBase64: string[];
        network: Network;
    }) => Promise<{ signedTransactionsBase64: string[] }>;
}

export interface SolanaWindow extends Window {
    solana: PhantomAdapter;
    glowSolana: PhantomAdapter;
    glow: GlowAdapter;
}
