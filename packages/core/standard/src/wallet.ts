import { WalletAccountFeatureNames, WalletAccountFeatures } from './features';
import { PropertyNames } from './typescript';

/** An account in the wallet that the app has been authorized to use. */
export type WalletAccount = Readonly<{
    /**
     * Address of the account, corresponding with the public key.
     * This may be the same as the public key on some chains (e.g. Solana), or different on others (e.g. Ethereum).
     */
    address: Uint8Array;

    /** Public key of the account, corresponding with the secret key to sign, encrypt, or decrypt using. */
    publicKey: Uint8Array;

    /** Chain to sign, simulate, and send transactions using. */
    chain: string;

    // TODO: think about custom features / namespacing
    /** Features supported by the account that are authorized to be called. */
    features: Readonly<Record<string, unknown>>;

    /** Optional user-friendly descriptive label or name of the account. */
    label?: string;
}>;

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
export type WalletPropertyNames<Account extends WalletAccount> = PropertyNames<Wallet<Account>>;

/** TODO: docs */
export type WalletProperties<Account extends WalletAccount> = Pick<Wallet<Account>, WalletPropertyNames<Account>>;

/** TODO: docs */
export type Wallet<Account extends WalletAccount> = Readonly<{
    /**
     * Version of the Wallet API.
     * If this changes, the wallet must emit a change event.
     * */
    version: string;

    /**
     * Name of the wallet.
     * This will be displayed by Wallet Adapter and apps. // TODO: remove references to Wallet Adapter
     * It should be canonical to the wallet extension.
     * If this changes, the wallet must emit a change event.
     */
    name: string;

    /**
     * Icon of the wallet.
     * This will be displayed by Wallet Adapter and apps.
     * It should be a data URL containing a base64-encoded SVG or PNG image. // TODO: is base64 actually needed? should other types be allowed?
     * If this changes, the wallet must emit a change event.
     */
    icon: string;

    /**
     * List the chains supported for signing, simulating, and sending transactions.
     * If this changes, the wallet must emit a change event.
     */
    chains: ReadonlyArray<Account['chain']>;

    /**
     * TODO: docs
     * If this changes, the wallet must emit a change event.
     */
    features: ReadonlyArray<WalletAccountFeatureNames<Account>>;

    /**
     * List the accounts the app is authorized to use.
     * This can be set by the wallet so the app can use authorized accounts on the initial page load.
     * If this changes, the wallet must emit a change event.
     */
    accounts: ReadonlyArray<Account>;

    /**
     * TODO: docs
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
        FeatureNames extends WalletAccountFeatureNames<Account>,
        Input extends ConnectInput<Account, Chain, FeatureNames>
    >(
        input: Input
    ): Promise<ConnectOutput<Account, Chain, FeatureNames, Input>>;

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

/** Input for connecting. */
export type ConnectInput<
    Account extends WalletAccount,
    Chain extends Account['chain'],
    FeatureNames extends WalletAccountFeatureNames<Account>
> = Readonly<{
    /** Optional chains to discover accounts using. */
    chains?: ReadonlyArray<Chain>;

    /** TODO: docs */
    features?: ReadonlyArray<FeatureNames>;

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
    FeatureNames extends WalletAccountFeatureNames<Account>,
    Input extends ConnectInput<Account, Chain, FeatureNames>
> = Readonly<{
    /** List of accounts in the wallet that the app has been authorized to use. */
    accounts: ReadonlyArray<ConnectedAccount<Account, Chain, FeatureNames, Input>>;

    /**
     * Will be true if there are more accounts with the given chain(s) and feature(s) in the wallet besides the `accounts` returned.
     * Apps may choose to notify the user or periodically call `connect` again to request more accounts.
     */
    hasMoreAccounts: boolean;
}>;

/** An account in the wallet that the app has been authorized to use. */
export type ConnectedAccount<
    Account extends WalletAccount,
    Chain extends Account['chain'],
    FeatureNames extends WalletAccountFeatureNames<Account>,
    Input extends ConnectInput<Account, Chain, FeatureNames>
> = Readonly<
    Omit<Account, 'chain' | 'features'> & {
        chain: Input extends { chains: ReadonlyArray<Chain> } ? Chain : Account['chain'];
        features: Input extends { features: ReadonlyArray<FeatureNames> }
            ? Pick<WalletAccountFeatures<Account>, Input['features'][number]>
            : Account['features'];
    }
>;
