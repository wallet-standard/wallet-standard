import type { PropertyNames } from '@wallet-standard/types';
import type { IdentifierArray } from './identifier.js';
import type { IconString } from './types.js';

/** An account in the wallet that the app has been authorized to use. */
export interface WalletAccount {
    /** Address of the account, corresponding with the public key. */
    address: string;

    /** Public key of the account, corresponding with the secret key to sign, encrypt, or decrypt using. */
    publicKey: Uint8Array;

    /** Chains supported by the account. */
    chains: IdentifierArray;

    /** Features supported by the account. */
    features: IdentifierArray;

    /** Optional user-friendly descriptive label or name for the account, to be displayed by apps. */
    label?: string;

    /**
     * Optional user-friendly icon for the account, to be displayed by apps.
     * Must be a data URI containing a base64-encoded SVG or PNG image.
     */
    icon?: IconString;

    /**
     * Add an event listener to subscribe to events.
     *
     * @param event    Event name to listen for.
     * @param listener Function that will be called when the event is emitted.
     *
     * @return Function to remove the event listener and unsubscribe.
     */
    on<E extends WalletAccountEventNames>(event: E, listener: WalletAccountEvents[E]): () => void;
}

/** TODO: docs */
export type WalletAccountPropertyNames = ReadonlyArray<NonNullable<PropertyNames<WalletAccount>>>;

/** TODO: docs */
export type WalletAccountProperties = Pick<WalletAccount, WalletAccountPropertyNames[number]>;

// TODO: test if this can be extended with custom events
/** Events emitted by wallets. */
export interface WalletAccountEvents {
    /**
     * Emitted when properties of the wallet have changed.
     *
     * @param properties Names of the properties that changed.
     */
    'standard:change'(properties: WalletAccountPropertyNames): void;
}

/** TODO: docs */
export type WalletAccountEventNames = keyof WalletAccountEvents;
