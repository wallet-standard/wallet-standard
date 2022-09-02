import type { PropertyNames, UnionToIntersection } from '@wallet-standard/types';
import type { WalletAccount } from './account.js';

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

    /**
     * Chains supported by the wallet.
     * If this changes, the wallet must emit a change event.
     */
    chains: ReadonlyArray<string>;

    /**
     * Standard features supported by the wallet.
     * If this changes, the wallet must emit a change event.
     */
    features: Record<string, unknown>;

    /**
     * Nonstandard extensions supported by the wallet.
     * If this changes, the wallet must emit a change event.
     */
    extensions: Record<string, unknown>;

    /**
     * TODO: docs
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
    on<E extends WalletEventNames<this>>(event: E, listener: WalletEvents<this>[E]): () => void;
}

// TODO: test if this can be extended with custom events
/** Events emitted by wallets. */
export interface WalletEvents<W extends Wallet> {
    /**
     * Emitted when properties of the wallet have changed.
     *
     * @param properties Names of the properties that changed.
     */
    change(properties: PropertyNames<W>[]): void;
}

/** TODO: docs */
export type WalletEventNames<W extends Wallet> = keyof WalletEvents<W>;

/** Input for connecting. */
export interface ConnectInput {
    /**
     * Set to true to request the authorized accounts without prompting the user.
     * The wallet should return only the accounts that the app is already authorized to connect to.
     */
    silent?: boolean;

    /** TODO: docs */
    chains?: ReadonlyArray<string>;

    /** TODO: docs */
    features?: ReadonlyArray<string>;

    /** TODO: docs */
    extensions?: ReadonlyArray<string>;
}

/** Output of connecting. */
export interface ConnectOutput {
    /** List of accounts in the wallet that the app has been authorized to use. */
    accounts: ReadonlyArray<WalletAccount>;
}
