import type { PropertyNames, UnionToIntersection } from '@wallet-standard/types';

export interface WalletInterface {
    name: string;
}

/** TODO: docs */
export interface Wallet {
    /**
     * Version of the Wallet Standard API.
     * If this changes, the wallet must emit a change event.
     * */
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
    chains: { [name: string]: unknown };

    /**
     * Standard features supported by the wallet.
     * If this changes, the wallet must emit a change event.
     */
    features: { [name: string]: unknown };

    /**
     * Nonstandard extensions supported by the wallet.
     * If this changes, the wallet must emit a change event.
     */
    extensions: { [name: string]: unknown };

    /**
     * List of accounts the app is authorized to use.
     * This can be set by the wallet so the app can use authorized accounts on the initial page load.
     * If this changes, the wallet must emit a change event.
     */
    accounts: WalletAccount<this>[];

    // TODO: think about extracting to features
    /**
     * Connect to accounts in the wallet.
     *
     * @param input Input for connecting.
     *
     * @return Output of connecting.
     */
    connect(input?: ConnectInput<this>): Promise<ConnectOutput<this>>;

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

/** An account in the wallet that the app has been authorized to use. */
export interface WalletAccount<W extends Wallet = Wallet> {
    /**
     * Address of the account, corresponding with the public key.
     * This may be the same as the public key on some chains (e.g. Solana), or different on others (e.g. Ethereum).
     */
    address: Uint8Array;

    /** Public key of the account, corresponding with the secret key to sign, encrypt, or decrypt using. */
    publicKey: Uint8Array;

    // TODO: think about separating chain and network -- single chain per account, multiple networks
    // TODO: this won't work on wallets though, which has an array of chains
    /** Chain to sign, simulate, and send transactions using. */
    chains: { [name in keyof W['chains']]?: boolean };

    /** List of standard features supported by the account. */
    features: { [name in keyof W['features']]?: boolean };

    /** List of nonstandard extensions supported by the account. */
    extensions: { [name in keyof W['extensions']]?: boolean };

    /** Optional user-friendly descriptive label or name for the account, to be displayed by apps. */
    label?: string;

    /**
     * Optional user-friendly icon for the account, to be displayed by apps.
     * Must be a data URL containing a base64-encoded SVG or PNG image. // TODO: is base64 actually needed? should other types be allowed?
     */
    icon?: string;
}

/** Input for connecting. */
export interface ConnectInput<W extends Wallet = Wallet> {
    /**
     * Set to true to request the authorized accounts without prompting the user.
     * The wallet should return only the accounts that the app is already authorized to connect to.
     */
    silent?: boolean;

    /** Chain to sign, simulate, and send transactions using. */
    chains?: { [name in keyof W['chains']]?: boolean };

    /** List of standard features supported by the account. */
    features?: { [name in keyof W['features']]?: boolean };

    /** List of nonstandard extensions supported by the account. */
    extensions?: { [name in keyof W['extensions']]?: boolean };
}

/** Output of connecting. */
export interface ConnectOutput<W extends Wallet = Wallet> {
    /** List of accounts in the wallet that the app has been authorized to use. */
    accounts: W['accounts'];
}

// TODO: test if this can be extended with custom events
/** Events emitted by wallets. */
export interface WalletEvents<W extends Wallet = Wallet> {
    /**
     * Emitted when properties of the wallet have changed.
     *
     * @param properties Names of the properties that changed.
     */
    change(properties: WalletPropertyNames<W>[]): void;
}

/** TODO: docs */
export type WalletEventNames<W extends Wallet = Wallet> = keyof WalletEvents<W>;

/** TODO: docs */
export type WalletPropertyNames<W extends Wallet = Wallet> = PropertyNames<W>;

/** TODO: docs */
export type WalletProperties<W extends Wallet = Wallet> = Pick<W, WalletPropertyNames<W>>;

/** TODO: docs */
export type WalletChains<W extends Wallet = Wallet> = UnionToIntersection<W['chains']>;

/** TODO: docs */
export type WalletChainName<W extends Wallet = Wallet> = keyof WalletChains<W>;

/** TODO: docs */
export type WalletFeatures<W extends Wallet = Wallet> = UnionToIntersection<W['features']>;

/** TODO: docs */
export type WalletFeatureName<W extends Wallet = Wallet> = keyof WalletFeatures<W>;

/** TODO: docs */
export type WalletExtensions<W extends Wallet = Wallet> = UnionToIntersection<W['extensions']>;

/** TODO: docs */
export type WalletExtensionName<W extends Wallet = Wallet> = keyof WalletExtensions<W>;
