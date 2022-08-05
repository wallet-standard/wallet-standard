import { WalletAccountMethodNames, WalletAccountMethods } from './methods';

/** A readonly byte array. */
export type Bytes = Readonly<Uint8Array>;

/** An account in the wallet that the app has been authorized to use. */
export interface WalletAccount {
    /**
     * Address of the account, corresponding with the public key.
     * This may be the same as the public key on some chains (e.g. Solana), or different on others (e.g. Ethereum).
     */
    address: Bytes;

    /** Public key of the account, corresponding with the secret key to sign, encrypt, or decrypt using. */
    publicKey: Bytes;

    /** Chain to sign, simulate, and send transactions using. */
    chain: string;

    /** List of ciphers supported for encryption and decryption. */
    ciphers: string[];

    /** Methods supported by the account that are authorized to be called. */
    // eslint-disable-next-line @typescript-eslint/ban-types
    methods: {};

    // TODO: think about custom methods / namespacing

    /** Optional user-friendly descriptive label or name of the account. */
    label?: string;
}

/** Events emitted by wallets. */
export interface WalletEvents {
    /**
     * Emitted when the accounts in the wallet are added or removed.
     * An app can listen for this event and call `connect` without arguments to request accounts again.
     */
    accountsChanged(): void;

    /**
     * Emitted when the chains the wallet supports are changed.
     * This can happen if the wallet supports adding chains, like Metamask.
     */
    chainsChanged(): void;
}

/** TODO: docs */
export type WalletEventNames = keyof WalletEvents;

/** TODO: docs */
export interface Wallet<Account extends WalletAccount> {
    /** Version of the Wallet API. */
    version: string;

    /**
     * Name of the wallet.
     * This will be displayed by Wallet Adapter and apps.
     * It should be canonical to the wallet extension.
     */
    name: string;

    /**
     * Icon of the wallet.
     * This will be displayed by Wallet Adapter and apps.
     * It should be a data URL containing a base64-encoded SVG or PNG image.
     */
    icon: string;

    /**
     * List the accounts the app is authorized to use.
     * This can be set by the wallet so the app can use authorized accounts on the initial page load.
     */
    accounts: Account[];

    /**
     * List the chains supported for signing, simulating, and sending transactions.
     * This can be updated by the wallet, which will emit a `chainsChanged` event when this occurs.
     */
    chains: Account['chain'][];

    /** TODO: docs */
    methods: WalletAccountMethodNames<Account>[];

    /** List the ciphers supported for encryption and decryption. */
    ciphers: Account['ciphers'];

    /**
     * Connect to accounts in the wallet.
     *
     * @param input Input for connecting.
     *
     * @return Output of connecting.
     */
    connect<
        Chain extends Account['chain'],
        MethodNames extends WalletAccountMethodNames<Account>,
        Input extends ConnectInput<Account, Chain, MethodNames>
    >(
        input: Input
    ): Promise<ConnectOutput<Account, Chain, MethodNames, Input>>;

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

/** Input for connecting. */
export interface ConnectInput<
    Account extends WalletAccount,
    Chain extends Account['chain'],
    MethodNames extends WalletAccountMethodNames<Account>
> {
    /** Chains to discover accounts using. */
    chains: Chain[];

    /** TODO: docs */
    methods?: MethodNames[];

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
    addresses?: Bytes[];

    /**
     * Set to true to request the authorized accounts without prompting the user.
     * The wallet should return only the accounts that the app is already authorized to connect to.
     */
    silent?: boolean;
}

/** Output of connecting. */
export interface ConnectOutput<
    Account extends WalletAccount,
    Chain extends Account['chain'],
    MethodNames extends WalletAccountMethodNames<Account>,
    Input extends ConnectInput<Account, Chain, MethodNames>
> {
    /** List of accounts in the wallet that the app has been authorized to use. */
    accounts: ConnectedAccount<Account, Chain, MethodNames, Input>[];

    /**
     * Will be true if there are more accounts with the given chain(s) and method(s) in the wallet besides the `accounts` returned.
     * Apps may choose to notify the user or periodically call `connect` again to request more accounts.
     */
    hasMoreAccounts: boolean;
}

/** An account in the wallet that the app has been authorized to use. */
export type ConnectedAccount<
    Account extends WalletAccount,
    Chain extends Account['chain'],
    MethodNames extends WalletAccountMethodNames<Account>,
    Input extends ConnectInput<Account, Chain, MethodNames>
> = Omit<Account, 'chain' | 'methods'> & {
    chain: Chain;
    methods: Input extends { methods: MethodNames[] }
        ? Pick<WalletAccountMethods<Account>, Input['methods'][number]>
        : Account['methods'];
};
