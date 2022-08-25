import type { PropertyNames, UnionToIntersection } from '@wallet-standard/types';

/** An account in the wallet that the app has been authorized to use. */
export type WalletAccount = Readonly<{
    /**
     * Address of the account, corresponding with the public key.
     * This may be the same as the public key on some chains (e.g. Solana), or different on others (e.g. Ethereum).
     */
    address: Uint8Array;

    /** Public key of the account, corresponding with the secret key to sign, encrypt, or decrypt using. */
    publicKey: Uint8Array;

    // TODO: is an account having a single chain a good model?
    /** Chain to sign, simulate, and send transactions using. */
    chain: string;

    //  TODO: what about declaring features/extensions on Wallet and passing accounts to it?
    /** Standard features supported by the account that are authorized to be used. */
    features: Readonly<Record<string, unknown>>;

    /** Nonstandard extensions supported by the account that are authorized to be used. */
    extensions: Readonly<Record<string, unknown>>;

    /** Optional user-friendly descriptive label or name for the account, to be displayed by apps. */
    label?: string;

    /**
     * Optional user-friendly icon for the account, to be displayed by apps.
     * Must be a data URL containing a base64-encoded SVG or PNG image. // TODO: is base64 actually needed? should other types be allowed?
     */
    icon?: string;
}>;

/** TODO: docs */
export type WalletAccountFeatures<Account extends WalletAccount> = UnionToIntersection<Account['features']>;

/** TODO: docs */
export type WalletAccountFeatureName<Account extends WalletAccount> = keyof WalletAccountFeatures<Account>;

/** TODO: docs */
export type WalletAccountExtensions<Account extends WalletAccount> = UnionToIntersection<Account['extensions']>;

/** TODO: docs */
export type WalletAccountExtensionName<Account extends WalletAccount> = keyof WalletAccountExtensions<Account>;

// TODO: test if this can be extended with custom events
/** Events emitted by wallets. */
export interface WalletEvents<Account extends WalletAccount> {
    /**
     * Emitted when properties of the wallet have changed.
     *
     * @param properties Names of the properties that changed.
     */
    change(properties: WalletPropertyNames<Account>[]): void;
}

/** TODO: docs */
export type WalletEventNames<Account extends WalletAccount> = keyof WalletEvents<Account>;

/** TODO: docs */
export type Wallet<Account extends WalletAccount> = Readonly<{
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
    chains: ReadonlyArray<Account['chain']>;

    /**
     * List of standard features supported by the wallet.
     * If this changes, the wallet must emit a change event.
     */
    features: ReadonlyArray<WalletAccountFeatureName<Account>>;

    /**
     * List of nonstandard features supported by the wallet.
     * If this changes, the wallet must emit a change event.
     */
    extensions: ReadonlyArray<WalletAccountExtensionName<Account>>;

    /**
     * List of accounts the app is authorized to use.
     * This can be set by the wallet so the app can use authorized accounts on the initial page load.
     * If this changes, the wallet must emit a change event.
     */
    accounts: ReadonlyArray<Account>;

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
        Chain extends Account['chain'],
        FeatureName extends WalletAccountFeatureName<Account>,
        ExtensionName extends WalletAccountExtensionName<Account>,
        Input extends ConnectInput<Account, Chain, FeatureName, ExtensionName>
    >(
        input?: Input
    ): Promise<ConnectOutput<Account, Chain, FeatureName, ExtensionName, Input>>;

    /**
     * Add an event listener to subscribe to events.
     *
     * @param event    Event name to listen for.
     * @param listener Function that will be called when the event is emitted.
     *
     * @return Function to remove the event listener and unsubscribe.
     */
    on<E extends WalletEventNames<Account>>(event: E, listener: WalletEvents<Account>[E]): () => void;
}>;

/** TODO: docs */
export type WalletPropertyNames<Account extends WalletAccount> = PropertyNames<Wallet<Account>>;

/** TODO: docs */
export type WalletProperties<Account extends WalletAccount> = Pick<Wallet<Account>, WalletPropertyNames<Account>>;

/** Input for connecting. */
export type ConnectInput<
    Account extends WalletAccount,
    Chain extends Account['chain'],
    FeatureName extends WalletAccountFeatureName<Account>,
    ExtensionName extends WalletAccountExtensionName<Account>
> = Readonly<{
    /** Optional chains to discover accounts using. */
    chains?: ReadonlyArray<Chain>;

    /** TODO: docs */
    features?: ReadonlyArray<FeatureName>;

    /** TODO: docs */
    extensions?: ReadonlyArray<ExtensionName>;

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
    addresses?: ReadonlyArray<Uint8Array>;

    /**
     * Set to true to request the authorized accounts without prompting the user.
     * The wallet should return only the accounts that the app is already authorized to connect to.
     */
    silent?: boolean;
}>;

/** Output of connecting. */
export type ConnectOutput<
    Account extends WalletAccount,
    Chain extends Account['chain'],
    FeatureName extends WalletAccountFeatureName<Account>,
    ExtensionName extends WalletAccountExtensionName<Account>,
    Input extends ConnectInput<Account, Chain, FeatureName, ExtensionName>
> = Readonly<{
    /** List of accounts in the wallet that the app has been authorized to use. */
    accounts: ReadonlyArray<ConnectedAccount<Account, Chain, FeatureName, ExtensionName, Input>>;

    /**
     * Will be true if there are more accounts with the given chain(s) and feature(s) in the wallet besides the `accounts` returned.
     * Apps may choose to notify the user or periodically call `connect` again to request more accounts.
     */
    hasMoreAccounts: boolean;
}>;

// TODO: test that this filters account types by chain/features/extensions
/** An account in the wallet that the app has been authorized to use. */
export type ConnectedAccount<
    Account extends WalletAccount,
    Chain extends Account['chain'],
    FeatureName extends WalletAccountFeatureName<Account>,
    ExtensionName extends WalletAccountExtensionName<Account>,
    Input extends ConnectInput<Account, Chain, FeatureName, ExtensionName>
> = Readonly<
    Omit<Account, 'chain' | 'features' | 'extensions'> & {
        chain: Input extends { chains: ReadonlyArray<Chain> } ? Chain : Account['chain'];
        features: Input extends { features: ReadonlyArray<FeatureName> }
            ? Pick<WalletAccountFeatures<Account>, Input['features'][number]>
            : Account['features'];
        extensions: Input extends { extensions: ReadonlyArray<ExtensionName> }
            ? Pick<WalletAccountExtensions<Account>, Input['extensions'][number]>
            : Account['extensions'];
    }
>;
