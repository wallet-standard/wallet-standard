import type { PropertyNames, UnionToIntersection, StringKeyOf } from '@wallet-standard/types';

/** An account in the wallet that the app has been authorized to use. */
export interface WalletAccount<
    Chain extends string = string,
    FeatureName extends string = string,
    ExtensionName extends string = string
> {
    /**
     * Address of the account, corresponding with the public key.
     * This may be the same as the public key on some chains (e.g. Solana), or different on others (e.g. Ethereum).
     */
    address: Uint8Array;

    /** Public key of the account, corresponding with the secret key to sign, encrypt, or decrypt using. */
    publicKey: Uint8Array;

    /** Chain to sign, simulate, and send transactions using. */
    chains: Chain[];

    /** List of standard features supported by the account. */
    features: Record<FeatureName, true>;

    /** List of nonstandard extensions supported by the account. */
    extensions: Record<ExtensionName, true>;

    /** Optional user-friendly descriptive label or name for the account, to be displayed by apps. */
    label?: string;

    /**
     * Optional user-friendly icon for the account, to be displayed by apps.
     * Must be a data URL containing a base64-encoded SVG or PNG image. // TODO: is base64 actually needed? should other types be allowed?
     */
    icon?: string;
}

/** TODO: docs */
export type WalletFeatures<W extends Wallet = Wallet> = UnionToIntersection<W['features']>;

/** TODO: docs */
export type WalletFeatureName<W extends Wallet = Wallet> = keyof WalletFeatures<W>;

/** TODO: docs */
export type WalletExtensions<W extends Wallet = Wallet> = UnionToIntersection<W['extensions']>;

/** TODO: docs */
export type WalletExtensionName<W extends Wallet = Wallet> = keyof WalletExtensions<W>;

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
     * List of chains supported by the wallet.
     * If this changes, the wallet must emit a change event.
     */
    chains: string[];

    /**
     * Standard features supported by the account that are authorized to be used.
     * If this changes, the wallet must emit a change event.
     */
    features: Record<string, unknown>;

    /**
     * Nonstandard extensions supported by the account that are authorized to be used.
     * If this changes, the wallet must emit a change event.
     */
    extensions: Record<string, unknown>;

    /**
     * List of accounts the app is authorized to use.
     * This can be set by the wallet so the app can use authorized accounts on the initial page load.
     * If this changes, the wallet must emit a change event.
     */
    accounts: WalletAccount<this['chains'][number], StringKeyOf<this['features']>, StringKeyOf<this['extensions']>>[];

    /**
     * `true` if calling `connect` may result in the app being authorized to use additional accounts.
     * If this changes, the wallet must emit a change event.
     */
    hasMoreAccounts: boolean;

    /**
     * Connect to accounts in the wallet.
     *
     * @param input Input for connecting.
     *
     * @return Output of connecting.
     */
    connect<
        Chain extends this['chains'][number],
        FeatureName extends StringKeyOf<this['features']>,
        ExtensionName extends StringKeyOf<this['extensions']>,
        Input extends ConnectInput<Chain, FeatureName, ExtensionName>
    >(
        input?: Input
    ): Promise<ConnectOutput<Chain, FeatureName, ExtensionName, Input, this['accounts'][number]>>;

    /**
     * Add an event listener to subscribe to events.
     *
     * @param event    Event name to listen for.
     * @param listener Function that will be called when the event is emitted.
     *
     * @return Function to remove the event listener and unsubscribe.
     */
    on<E extends WalletEventNames>(event: E, listener: WalletEvents<this>[E]): () => void;
}

/** TODO: docs */
export type WalletPropertyNames<W extends Wallet> = PropertyNames<W>;

/** TODO: docs */
export type WalletProperties<W extends Wallet> = Pick<W, WalletPropertyNames<W>>;

/** Input for connecting. */
export interface ConnectInput<Chain extends string, FeatureName extends string, ExtensionName extends string> {
    /** Optional chains to discover accounts using. */
    chains?: Chain[];

    /** TODO: docs */
    features?: FeatureName[];

    /** TODO: docs */
    extensions?: ExtensionName[];

    // TODO: decide if addresses are even needed
    /**
     * Optional public key addresses of the accounts in the wallet to authorize an app to use.
     *
     * If addresses are provided:
     *   - The wallet must return only the accounts requested.
     *   - If any account isn't found, or authorization is refused for any account, TODO: determine desired behavior -- is it better to fail, or return a subset?
     *   - If the wallet has already authorized the app to use all the accounts requested, they should be returned without prompting the user.
     *   - If the `silent` option is not provided or `false`, the wallet may prompt the user if needed to authorize accounts.
     *   - If the `silent` option is `true`, the wallet must not prompt the user, and should return requested accounts the app is authorized to use.
     *
     * If no addresses are provided:
     *   - If the `silent` option is not provided or `false`, the wallet should prompt the user to select accounts to authorize the app to use.
     *   - If the `silent` option is `true`, the wallet must not prompt the user, and should return any accounts the app is authorized to use.
     */
    addresses?: Uint8Array[];

    /**
     * Set to true to request the authorized accounts without prompting the user.
     * The wallet should return only the accounts that the app is already authorized to connect to.
     */
    silent?: boolean;
}

/** Output of connecting. */
export interface ConnectOutput<
    Chain extends string,
    FeatureName extends string,
    ExtensionName extends string,
    Input extends ConnectInput<Chain, FeatureName, ExtensionName>,
    Account extends WalletAccount<string, string, string>
> {
    /** List of accounts in the wallet that the app has been authorized to use. */
    accounts: ConnectedAccount<Chain, FeatureName, ExtensionName, Input, Account>[];

    /**
     * Will be true if there are more accounts with the given chain(s) and feature(s) in the wallet besides the `accounts` returned.
     * Apps may choose to notify the user or periodically call `connect` again to request more accounts.
     */
    hasMoreAccounts: boolean;
}

// TODO: test that this filters account types by chain/features/extensions
/** An account in the wallet that the app has been authorized to use. */
export type ConnectedAccount<
    Chain extends string,
    FeatureName extends string,
    ExtensionName extends string,
    Input extends ConnectInput<Chain, FeatureName, ExtensionName>,
    Account extends WalletAccount<string, string, string>
> = Omit<Account, 'chains' | 'features' | 'extensions'> & {
    chains: Input extends { chains: Chain[] } ? Chain[] : Account['chains'];
    features: Input extends { features: FeatureName[] } ? Record<FeatureName, true> : Account['features'];
    extensions: Input extends { extensions: ExtensionName[] } ? Record<ExtensionName, true> : Account['extensions'];
};
