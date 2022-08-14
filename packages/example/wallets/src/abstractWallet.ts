import {
    ConnectedAccount,
    ConnectInput,
    ConnectOutput,
    VERSION_1_0_0,
    Wallet,
    WalletAccount,
    WalletAccountExtensionName,
    WalletAccountFeatureName,
    WalletEventNames,
    WalletEvents,
} from '@wallet-standard/standard';
import { bytesEqual, pick } from '@wallet-standard/util';

export abstract class AbstractWallet<Account extends WalletAccount> implements Wallet<Account> {
    protected _listeners: { [E in WalletEventNames<Account>]?: WalletEvents<Account>[E][] } = {};
    protected _accounts: Account[];

    get version() {
        return VERSION_1_0_0;
    }

    abstract get name(): string;

    abstract get icon(): string;

    get chains() {
        const chains = this._accounts.map((account) => account.chain);
        return [...new Set(chains)];
    }

    get features() {
        const features = this._accounts.flatMap((account) =>
            Object.keys(account.features)
        ) as WalletAccountFeatureName<Account>[];
        return [...new Set(features)];
    }

    get extensions() {
        return [];
    }

    get accounts() {
        return this._accounts.slice();
    }

    get hasMoreAccounts() {
        return false;
    }

    constructor(accounts: Account[]) {
        this._accounts = accounts;
    }

    async connect<
        Chain extends Account['chain'],
        FeatureName extends WalletAccountFeatureName<Account>,
        ExtensionName extends WalletAccountExtensionName<Account>,
        Input extends ConnectInput<Account, Chain, FeatureName, ExtensionName>
    >(input?: Input): Promise<ConnectOutput<Account, Chain, FeatureName, ExtensionName, Input>> {
        const { chains, addresses, features, silent } = input || {};

        let accounts = this.accounts;

        if (chains) {
            // Filter out accounts that don't have any of the chains requested
            accounts = accounts.filter((account) => chains.includes(account.chain as Chain));
        }

        if (addresses) {
            // Filter out accounts that don't have the addresses requested
            accounts = accounts.filter((account) => addresses.some((address) => bytesEqual(address, account.address)));
        }

        if (features) {
            // Filter out accounts that don't have every feature requested
            accounts = accounts.filter((account) => features.every((feature) => feature in account.features));
            // Filter out features of accounts to only what is requested
            accounts = accounts.map((account) => ({
                // FIXME: this won't work when account is a class instance
                ...account,
                features: pick(account.features as { [_ in FeatureName]: any }, ...features),
            }));
        }

        // TODO: ask the user to grant access to the desired set, unless `silent` is true

        return {
            accounts: accounts as ConnectedAccount<any, Chain, FeatureName, ExtensionName, Input>[],
            // FIXME: this should be true if there are more accounts found for the given inputs that weren't granted access
            hasMoreAccounts: false,
        };
    }

    on<E extends WalletEventNames<Account>>(event: E, listener: WalletEvents<Account>[E]): () => void {
        this._listeners[event]?.push(listener) || (this._listeners[event] = [listener]);
        return (): void => this.#off(event, listener);
    }

    #emit<E extends WalletEventNames<Account>>(event: E, ...args: Parameters<WalletEvents<Account>[E]>): void {
        // eslint-disable-next-line prefer-spread
        this._listeners[event]?.forEach((listener) => listener.apply(null, args));
    }

    #off<E extends WalletEventNames<Account>>(event: E, listener: WalletEvents<Account>[E]): void {
        this._listeners[event] = this._listeners[event]?.filter((existingListener) => listener !== existingListener);
    }
}
