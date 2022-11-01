/**
 * A namespaced identifier in the format `${namespace}:${reference}`.
 * Used by {@link IdentifierArray} and {@link IdentifierRecord}.
 */
export type IdentifierString = `${string}:${string}`;

/**
 * An array of namespaced identifiers in the format `${namespace}:${reference}`.
 * Used by {@link Wallet.chains}.
 */
export type IdentifierArray = ReadonlyArray<IdentifierString>;

/**
 * An object where the keys are namespaced identifiers in the format `${namespace}:${reference}`.
 * Used by {@link Wallet.features}, {@link WalletAccount.chains}, and {@link WalletAccount.features}.
 */
export type IdentifierRecord<T> = Readonly<Record<IdentifierString, T>>;

/**
 * Version of the Wallet Standard itself used by a {@link Wallet}. **NOT** a version number for a Wallet itself.
 * This may be used by the app to determine compatibility and feature detect.
 */
export type WalletVersion = '1.0.0';

/**
 * A data URI containing a base64-encoded SVG, WebP, PNG, or GIF image.
 * Used by @
 */
export type WalletIcon = `data:image/${'svg+xml' | 'webp' | 'png' | 'gif'};base64,${string}`;

/**
 * Interface of a Wallet, also referred to as a Standard Wallet.
 * A Standard Wallet implements and adheres to the Wallet Standard.
 */
export interface Wallet {
    /** Version of the Wallet Standard implemented by the Wallet. */
    readonly version: WalletVersion;

    /**
     * Name of the Wallet. This may be displayed by the app.
     * Must be static, descriptive, unique, and canonical to the wallet extension or application.
     */
    readonly name: string;

    /** Icon of the Wallet. This may be displayed by the app. */
    readonly icon: WalletIcon;

    /**
     * Chains supported by the Wallet.
     * A **chain** is an {@link IdentifierString} which identifies a blockchain in a canonical, human-readable format.
     * [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md) chain IDs are compatible with this,
     * but are not required to be used.
     *
     * Each chain should define its own chains by extension of the Wallet Standard.
     * The `standard` and `experimental` namespaces are reserved by the Wallet Standard.
     *
     * The {@link EventsFeature | `standard:events` feature} may be used to notify the app of changes.
     */
    readonly chains: IdentifierArray;

    /**
     * Features supported by the Wallet.
     * A **feature name** is an {@link IdentifierString} which identifies a **feature** in a canonical, human-readable
     * format.
     *
     * Each chain should define its own features by extension of the Wallet Standard.
     * The `standard` and `experimental` namespaces are reserved by the Wallet Standard.
     *
     * A **feature** may be anything -- a single method or value, or a collection of them. A **conventional feature** looks like this:
     *
     * ```ts
     *  export type FooEncryptFeature = {
     *      // Name of the feature.
     *      'foo:encrypt': {
     *          // Version of the feature.
     *          version: '1.0.0';
     *          // Properties of the feature.
     *          ciphers: ['x25519-xsalsa20-poly1305'];
     *          // Methods of the feature.
     *          encrypt (data: Uint8Array): Promise<Uint8Array>;
     *      };
     *  };
     * ```
     *
     * The {@link EventsFeature | `standard:events` feature} may be used to notify the app of changes.
     */
    readonly features: IdentifierRecord<unknown>;

    /**
     * List of {@link WalletAccount | accounts} that the app is authorized to use.
     * This can be set by the Wallet so the app can use authorized accounts on the initial page load.
     * The {@link EventsFeature | `standard:events` feature} may be used to notify the app of changes.
     */
    readonly accounts: ReadonlyArray<WalletAccount>;
}

/**
 * An account of the {@link Wallet} that the app is authorized to use.
 * Wallets may use or extend {@link ReadonlyWalletAccount} which implements this interface.
 */
export interface WalletAccount {
    /** Address of the account, corresponding with the public key. */
    readonly address: string;

    /** Public key of the account, corresponding with the secret key to sign, encrypt, or decrypt using. */
    readonly publicKey: Uint8Array;

    /**
     * Chains supported by the account.
     * This must be a subset of the {@link Wallet.chains | Wallet chains}.
     */
    readonly chains: IdentifierArray;

    /**
     * Feature names supported by the account.
     * This must be a subset of the names of {@link Wallet.features | Wallet features}.
     */
    readonly features: IdentifierArray;

    /** Optional user-friendly descriptive label or name for the account. This may be displayed by the app. */
    readonly label?: string;

    /** Optional user-friendly icon for the account. This may be displayed by the app. */
    readonly icon?: WalletIcon;
}

/** Helper type for defining a {@link Wallet} with a union or intersection of {@link Wallet.features | features}. */
export type WalletWithFeatures<Features extends Wallet['features']> = Omit<Wallet, 'features'> & {
    features: Features;
};
