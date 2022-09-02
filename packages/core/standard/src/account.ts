import type { PropertyNames } from '@wallet-standard/types';

/** An account in the wallet that the app has been authorized to use. */
export interface WalletAccount {
    /** Address of the account, corresponding with the public key. */
    address: string;

    /** Public key of the account, corresponding with the secret key to sign, encrypt, or decrypt using. */
    publicKey: Uint8Array;

    /** Chains supported by the account. */
    chains: ReadonlyArray<string>;

    /** Standard features supported by the account. */
    features: ReadonlyArray<string>;

    /** Nonstandard extensions supported by the account. */
    extensions: ReadonlyArray<string>;

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
export type WalletAccountEventNames<A extends WalletAccount> = keyof WalletAccountEvents<A>;
