import type { Wallet } from './wallet.js';

interface UnstoppableCustomEvent<T extends string, D> extends Event {
    /** TODO: docs */
    readonly type: T;
    /** TODO: docs */
    readonly detail: D;
    /** @deprecated */
    preventDefault(): never;
    /** @deprecated */
    stopImmediatePropagation(): never;
    /** @deprecated */
    stopPropagation(): never;
}

/** TODO: docs */
export type WindowAppReadyEventType = 'wallet-standard:app-ready';

/** TODO: docs */
export interface WindowAppReadyEventAPI {
    /** TODO: docs */
    register(wallet: Wallet): () => void;
}

/** TODO: docs */
export type WindowAppReadyEvent = UnstoppableCustomEvent<WindowAppReadyEventType, WindowAppReadyEventAPI>;

/** TODO: docs */
export type WindowRegisterWalletEventType = 'wallet-standard:register-wallet';

/** TODO: docs */
export type WindowRegisterWalletEventCallback = (api: WindowAppReadyEventAPI) => void;

/** TODO: docs */
export type WindowRegisterWalletEvent = UnstoppableCustomEvent<
    WindowRegisterWalletEventType,
    WindowRegisterWalletEventCallback
>;

/** TODO: docs */
export interface WalletEventsWindow extends Omit<Window, 'addEventListener' | 'dispatchEvent'> {
    /** TODO: docs */
    addEventListener(type: WindowAppReadyEventType, listener: (event: WindowAppReadyEvent) => void): void;
    /** TODO: docs */
    addEventListener(type: WindowRegisterWalletEventType, listener: (event: WindowRegisterWalletEvent) => void): void;
    /** TODO: docs */
    dispatchEvent(event: WindowAppReadyEvent): void;
    /** TODO: docs */
    dispatchEvent(event: WindowRegisterWalletEvent): void;
}

/** @deprecated */
export interface DEPRECATED_WalletsWindow extends Window {
    navigator: DEPRECATED_WalletsNavigator;
}

/** @deprecated */
export interface DEPRECATED_WalletsNavigator extends Navigator {
    wallets?: DEPRECATED_Wallets;
}

/** @deprecated */
export interface DEPRECATED_Wallets {
    push(...callbacks: DEPRECATED_WalletsCallback[]): void;
}

/** @deprecated */
export type DEPRECATED_WalletsCallback = (wallets: { register(...wallets: Wallet[]): () => void }) => void;
