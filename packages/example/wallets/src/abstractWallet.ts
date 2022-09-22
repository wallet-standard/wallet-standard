import type {
    IconString,
    IdentifierArray,
    IdentifierRecord,
    Wallet,
    WalletAccount,
    WalletEventNames,
    WalletEvents,
} from '@wallet-standard/standard';

export abstract class AbstractWalletAccount implements WalletAccount {
    readonly #address: string;
    readonly #publicKey: Uint8Array;
    readonly #chains: IdentifierArray;
    readonly #features: IdentifierArray;

    get address() {
        return this.#address;
    }

    get publicKey() {
        return this.#publicKey.slice();
    }

    get chains() {
        return this.#chains.slice();
    }

    get features() {
        return this.#features.slice();
    }

    constructor(address: string, publicKey: Uint8Array, chains: IdentifierArray, features: IdentifierArray) {
        this.#address = address;
        this.#publicKey = publicKey;
        this.#chains = chains;
        this.#features = features;
    }
}

export abstract class AbstractWallet implements Wallet {
    #listeners: { [E in WalletEventNames]?: WalletEvents[E][] } = {};

    protected _accounts: AbstractWalletAccount[];

    get version() {
        return '1.0.0' as const;
    }

    abstract get name(): string;
    abstract get icon(): IconString;
    abstract get chains(): IdentifierArray;
    abstract get features(): IdentifierRecord<unknown>;

    get accounts() {
        return this._accounts.slice();
    }

    constructor(accounts: AbstractWalletAccount[]) {
        this._accounts = accounts;
    }

    on<E extends WalletEventNames>(event: E, listener: WalletEvents[E]): () => void {
        this.#listeners[event]?.push(listener) || (this.#listeners[event] = [listener]);
        return (): void => this.#off(event, listener);
    }

    protected _emit<E extends WalletEventNames>(event: E, ...args: Parameters<WalletEvents[E]>): void {
        // eslint-disable-next-line prefer-spread
        this.#listeners[event]?.forEach((listener) => listener.apply(null, args));
    }

    #off<E extends WalletEventNames>(event: E, listener: WalletEvents[E]): void {
        this.#listeners[event] = this.#listeners[event]?.filter((existingListener) => listener !== existingListener);
    }
}

export abstract class PossiblyLedgerWalletAccount extends AbstractWalletAccount {
    abstract readonly ledger: boolean;
}

export class SignerWalletAccount extends PossiblyLedgerWalletAccount {
    get ledger() {
        return false;
    }
}

export class LedgerWalletAccount extends PossiblyLedgerWalletAccount {
    get ledger() {
        return true;
    }
}
