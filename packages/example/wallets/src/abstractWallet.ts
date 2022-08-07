import {
    bytesEqual,
    ConnectedAccount,
    ConnectInput,
    ConnectOutput,
    DEFAULT_VERSION,
    pick,
    Wallet,
    WalletAccount,
    WalletAccountMethodNames,
    WalletEventNames,
    WalletEvents,
} from '@solana/wallet-standard';

export abstract class AbstractWallet<Account extends WalletAccount> implements Wallet<Account> {
    protected _version = DEFAULT_VERSION;
    protected _listeners: { [E in WalletEventNames]?: WalletEvents[E][] } = {};
    protected _accounts: Account[];

    get version() {
        return this._version;
    }

    abstract get name(): string;

    abstract get icon(): string;

    get accounts() {
        return this._accounts.slice();
    }

    get chains() {
        const chains = this._accounts.map((account) => account.chain);
        return [...new Set(chains)];
    }

    get methods() {
        const methods = this._accounts.flatMap(
            (account) => Object.keys(account.methods) as keyof typeof account.methods
        );
        return [...new Set(methods)];
    }

    get ciphers() {
        const ciphers = this._accounts.flatMap((account) => account.ciphers);
        return [...new Set(ciphers)];
    }

    constructor(accounts: Account[]) {
        this._accounts = accounts;
    }

    async connect<
        Chain extends Account['chain'],
        MethodNames extends WalletAccountMethodNames<Account>,
        Input extends ConnectInput<Account, Chain, MethodNames>
    >({ chains, addresses, methods, silent }: Input): Promise<ConnectOutput<Account, Chain, MethodNames, Input>> {
        let accounts = this.accounts;

        if (chains) {
            // Filter out accounts that don't have any of the chains requested
            accounts = accounts.filter((account) => chains.includes(account.chain as Chain));
        }

        if (addresses) {
            // Filter out accounts that don't have the addresses requested
            accounts = accounts.filter((account) => addresses.some((address) => bytesEqual(address, account.address)));
        }

        if (methods) {
            // Filter out accounts that don't have every method requested
            accounts = accounts.filter((account) => methods.every((method) => method in account.methods));
            // Filter out methods of accounts to only what is requested
            accounts = accounts.map((account) => ({
                // FIXME: this won't work when account is a class instance
                ...account,
                methods: pick(account.methods as { [_ in MethodNames]: any }, ...methods),
            }));
        }

        // TODO: ask the user to grant access to the desired set, unless `silent` is true

        return {
            accounts: accounts as ConnectedAccount<any, Chain, MethodNames, Input>[],
            // FIXME: this should be true if there are more accounts found for the given inputs that weren't granted access
            hasMoreAccounts: false,
        };
    }

    on<E extends WalletEventNames>(event: E, listener: WalletEvents[E]): () => void {
        this._listeners[event]?.push(listener) || (this._listeners[event] = [listener]);
        return (): void => this._off(event, listener);
    }

    protected _emit<E extends WalletEventNames>(event: E): void {
        this._listeners[event]?.forEach((listener) => listener());
    }

    protected _off<E extends WalletEventNames>(event: E, listener: WalletEvents[E]): void {
        this._listeners[event] = this._listeners[event]?.filter((existingListener) => listener !== existingListener);
    }
}
