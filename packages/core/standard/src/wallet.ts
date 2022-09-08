import type { PropertyNames } from '@wallet-standard/types';
import type { WalletAccount } from './account.js';
import type { IdentifierArray, IdentifierRecord } from './identifier.js';

/** TODO: docs */
export type WalletVersion = '1.0.0';

// TODO: is base64 actually needed? should other types be allowed?
/** TODO: docs */
export type WalletIcon = `data:${'image/svg+xml' | 'image/png'};base64,${string}`;

/** TODO: docs */
export interface Wallet {
    /**
     * Version of the Wallet API.
     * If this changes, the wallet must emit a change event.
     */
    version: WalletVersion;

    /**
     * Name of the wallet, to be displayed by apps.
     * Must be canonical to the wallet extension.
     * If this changes, the wallet must emit a change event.
     */
    name: string;

    /**
     * Icon of the wallet, to be displayed by apps.
     * Must be a data URI containing a base64-encoded SVG or PNG image.
     * If this changes, the wallet must emit a change event.
     */
    icon: WalletIcon;

    // TODO: consider adding chain type
    /**
     * Chains supported by the wallet.
     * If this changes, the wallet must emit a change event.
     */
    chains: IdentifierArray;

    /**
     * Features supported by the wallet.
     * If this changes, the wallet must emit a change event.
     */
    features: IdentifierRecord<unknown>;

    /**
     * List of accounts the app is authorized to use.
     * This can be set by the wallet so the app can use authorized accounts on the initial page load.
     * If this changes, the wallet must emit a change event.
     */
    accounts: ReadonlyArray<WalletAccount>;

    /**
     * Connect to accounts in the wallet.
     *
     * @param input Input for connecting.
     *
     * @return Output of connecting.
     */
    connect(input?: ConnectInput): Promise<ConnectOutput>;

    /**
     * Add an event listener to subscribe to events.
     *
     * @param event    Event name to listen for.
     * @param listener Function that will be called when the event is emitted.
     *
     * @return Function to remove the event listener and unsubscribe.
     */
    on<E extends WalletEventNames>(event: E, listener: WalletEvents[E]): () => void;
}

/** TODO: docs */
export type WalletPropertyNames = ReadonlyArray<NonNullable<PropertyNames<Wallet>>>;

/** TODO: docs */
export type WalletProperties = Pick<Wallet, WalletPropertyNames[number]>;

// TODO: test if this can be extended with custom events
/** Events emitted by wallets. */
export interface WalletEvents {
    /**
     * Emitted when properties of the wallet have changed.
     *
     * @param properties Names of the properties that changed.
     */
    'standard:change'(properties: WalletPropertyNames): void;
}

/** TODO: docs */
export type WalletEventNames = keyof WalletEvents;

/** Input for connecting. */
export interface ConnectInput {
    /**
     * Set to true to request the authorized accounts without prompting the user.
     * The wallet should return only the accounts that the app is already authorized to connect to.
     */
    silent?: boolean;

    /** TODO: docs */
    chains?: IdentifierArray;

    /** TODO: docs */
    features?: IdentifierArray;
}

/** Output of connecting. */
export interface ConnectOutput {
    /** List of accounts in the wallet that the app has been authorized to use. */
    accounts: ReadonlyArray<WalletAccount>;
}
