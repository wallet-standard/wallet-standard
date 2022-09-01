import type { PropertyNames, UnionToIntersection } from '@wallet-standard/types';

/** TODO: docs */
export interface Wallet {
    /**
     * Version of the Wallet API.
     * If this changes, the wallet must emit a change event.
     */
    version: '1.0.0';

    /**
     * Name of the wallet, to be displayed by apps.
     * Must be canonical to the wallet extension.
     * If this changes, the wallet must emit a change event.
     */
    name: string;

    /**
     * Icon of the wallet, to be displayed by apps.
     * Must be a data URL containing a base64-encoded SVG or PNG image. // TODO: is base64 actually needed? should other types be allowed?
     * If this changes, the wallet must emit a change event.
     */
    icon: string;

    /** TODO: docs */
    interfaces: Record<string, WalletInterface>;

    /**
     * Add an event listener to subscribe to events.
     *
     * @param event    Event name to listen for.
     * @param listener Function that will be called when the event is emitted.
     *
     * @return Function to remove the event listener and unsubscribe.
     */
    on<E extends WalletEventNames<this>>(event: E, listener: WalletEvents<this>[E]): () => void;
}

// TODO: test if this can be extended with custom events
/** Events emitted by wallets. */
export type WalletEvents<W extends Wallet> = {
    /**
     * Emitted when properties of the wallet have changed.
     *
     * @param properties Names of the properties that changed.
     */
    change(properties: PropertyNames<W>[]): void;
};

/** TODO: docs */
export type WalletEventNames<W extends Wallet> = keyof WalletEvents<W>;

/** TODO: docs */
export interface WalletInterface {
    /**
     * Chains supported by the interface.
     * If this changes, the interface must emit a change event.
     */
    chains: ReadonlyArray<string>;

    // FIXME: no way to detect all available account features here
    /**
     * Standard features supported by the interface.
     * If this changes, the interface must emit a change event.
     */
    features: Record<string, unknown>;

    // FIXME: no way to detect all available account extensions here
    /**
     * Nonstandard extensions supported by the interface.
     * If this changes, the interface must emit a change event.
     */
    extensions: Record<string, unknown>;

    /**
     * List of accounts the app is authorized to use.
     * This can be set by the wallet so the app can use authorized accounts on the initial page load.
     * If this changes, the interface must emit a change event.
     */
    accounts: WalletAccount[];

    /** TODO: docs */
    accountFeatures: ReadonlyArray<keyof UnionToIntersection<this['accounts'][number]['features']>>;

    /** TODO: docs */
    accountExtensions: ReadonlyArray<keyof UnionToIntersection<this['accounts'][number]['extensions']>>;

    /**
     * Add an event listener to subscribe to events.
     *
     * @param event    Event name to listen for.
     * @param listener Function that will be called when the event is emitted.
     *
     * @return Function to remove the event listener and unsubscribe.
     */
    on<E extends WalletInterfaceEventNames<this>>(event: E, listener: WalletInterfaceEvents<this>[E]): () => void;
}

// TODO: test if this can be extended with custom events
/** Events emitted by wallets. */
export type WalletInterfaceEvents<I extends WalletInterface> = {
    /**
     * Emitted when properties of the wallet have changed.
     *
     * @param properties Names of the properties that changed.
     */
    change(properties: PropertyNames<I>[]): void;
};

/** TODO: docs */
export type WalletInterfaceEventNames<I extends WalletInterface> = keyof WalletInterfaceEvents<I>;

/** An account in the wallet that the app has been authorized to use. */
export interface WalletAccount {
    /** Address of the account, corresponding with the public key. */
    address: string;

    /** Public key of the account, corresponding with the secret key to sign, encrypt, or decrypt using. */
    publicKey: Uint8Array;

    /** Chains supported by the account. */
    chains: ReadonlyArray<string>;

    /** Standard features supported by the account. */
    features: Record<string, unknown>;

    /** Nonstandard extensions supported by the account. */
    extensions: Record<string, unknown>;

    /** Optional user-friendly descriptive label or name for the account, to be displayed by apps. */
    label?: string;

    /**
     * Optional user-friendly icon for the account, to be displayed by apps.
     * Must be a data URL containing a base64-encoded SVG or PNG image. // TODO: is base64 actually needed? should other types be allowed?
     */
    icon?: string;

    /**
     * Add an event listener to subscribe to events.
     *
     * @param event    Event name to listen for.
     * @param listener Function that will be called when the event is emitted.
     *
     * @return Function to remove the event listener and unsubscribe.
     */
    on<E extends WalletAccountEventNames<this>>(event: E, listener: WalletAccountEvents<this>[E]): () => void;
}

// TODO: test if this can be extended with custom events
/** Events emitted by wallets. */
export type WalletAccountEvents<A extends WalletAccount> = {
    /**
     * Emitted when properties of the wallet have changed.
     *
     * @param properties Names of the properties that changed.
     */
    change(properties: PropertyNames<A>[]): void;
};

/** TODO: docs */
export type WalletAccountEventNames<I extends WalletAccount> = keyof WalletAccountEvents<I>;
