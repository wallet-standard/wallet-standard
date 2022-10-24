import type { Wallet } from './wallet.js';

/** TODO: docs */
export interface AppInitializeEventAPI {
    /** TODO: docs */
    register(wallet: Wallet): () => void;
}

/** TODO: docs */
export type AppInitializeEventType = 'wallet-standard-app-initialize';

/** TODO: docs */
export interface AppInitializeEvent extends CustomEvent<AppInitializeEventAPI> {
    /** TODO: docs */
    readonly type: AppInitializeEventType;
}

/** TODO: docs */
export type WalletInitializeEventCallback = (api: AppInitializeEventAPI) => void;

/** TODO: docs */
export type WalletInitializeEventType = 'wallet-standard-wallet-initialize';

/** TODO: docs */
export interface WalletInitializeEvent extends CustomEvent<WalletInitializeEventCallback> {
    /** TODO: docs */
    readonly type: WalletInitializeEventType;
}

/** TODO: docs */
export interface WalletEventsWindow {
    /** TODO: docs */
    addEventListener(type: AppInitializeEventType, listener: (event: AppInitializeEvent) => void): void;
    /** TODO: docs */
    addEventListener(type: WalletInitializeEventType, listener: (event: WalletInitializeEvent) => void): void;
    /** TODO: docs */
    dispatchEvent(event: AppInitializeEvent): void;
    /** TODO: docs */
    dispatchEvent(event: WalletInitializeEvent): void;
}
