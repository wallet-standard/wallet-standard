/** A namespaced identifier in the format `${namespace}:${string}`. */
export type IdentifierString = `${string}:${string}`;

/** An array of namespaced identifiers in the format `${namespace}:${string}`. */
export type IdentifierArray = ReadonlyArray<IdentifierString>;

/** An object where the keys are namespaced identifiers in the format `${namespace}:${string}`. */
export type IdentifierRecord<T> = Readonly<Record<IdentifierString, T>>;

/** TODO: docs */
export type WalletVersion = '1.0.0';

/** A data URI containing a base64-encoded SVG, WebP, PNG, or GIF image. */
export type WalletIcon = `data:image/${'svg+xml' | 'webp' | 'png' | 'gif'};base64,${string}`;

/** TODO: docs */
export interface Wallet {
    /** Version of the Wallet Standard implemented by the wallet. */
    readonly version: WalletVersion;

    /**
     * Name of the wallet, to be displayed by apps.
     * Must be canonical to the wallet extension.
     */
    readonly name: string;

    /** Icon of the wallet, to be displayed by apps. */
    readonly icon: WalletIcon;

    /** Chains supported by the wallet. */
    readonly chains: IdentifierArray;

    /** Features supported by the wallet. */
    readonly features: IdentifierRecord<unknown>;

    /**
     * List of accounts the app is authorized to use.
     * This can be set by the wallet so the app can use authorized accounts on the initial page load.
     */
    readonly accounts: ReadonlyArray<WalletAccount>;
}

/** An account in the wallet that the app has been authorized to use. */
export interface WalletAccount {
    /** Address of the account, corresponding with the public key. */
    readonly address: string;

    /** Public key of the account, corresponding with the secret key to sign, encrypt, or decrypt using. */
    readonly publicKey: Uint8Array;

    /** Chains supported by the account. */
    readonly chains: IdentifierArray;

    /** Features supported by the account. */
    readonly features: IdentifierArray;

    /** Optional user-friendly descriptive label or name for the account, to be displayed by apps. */
    readonly label?: string;

    /** Optional user-friendly icon for the account, to be displayed by apps. */
    readonly icon?: WalletIcon;
}

/** TODO: docs */
export type WalletWithFeatures<Features extends Wallet['features']> = Omit<Wallet, 'features'> & {
    features: Features;
};
