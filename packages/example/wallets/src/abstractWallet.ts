import type { EventsListeners, EventsNames, EventsOnMethod, Wallet, WalletAccount } from '@wallet-standard/core';
import { ReadonlyWalletAccount } from '@wallet-standard/core';

export abstract class AbstractWallet implements Wallet {
    #listeners: { [E in EventsNames]?: EventsListeners[E][] } = {};

    protected _accounts: ReadonlyWalletAccount[];

    get version() {
        return '1.0.0' as const;
    }

    abstract get name(): Wallet['name'];
    abstract get icon(): Wallet['icon'];
    abstract get chains(): Wallet['chains'];
    abstract get features(): Wallet['features'];

    get accounts() {
        return this._accounts.slice();
    }

    constructor(accounts: ReadonlyWalletAccount[]) {
        this._accounts = accounts;
    }

    protected _on: EventsOnMethod = (event, listener) => {
        this.#listeners[event]?.push(listener) || (this.#listeners[event] = [listener]);
        return (): void => this._off(event, listener);
    };

    protected _emit<E extends EventsNames>(event: E, ...args: Parameters<EventsListeners[E]>): void {
        // eslint-disable-next-line prefer-spread
        this.#listeners[event]?.forEach((listener) => listener.apply(null, args));
    }

    protected _off<E extends EventsNames>(event: E, listener: EventsListeners[E]): void {
        this.#listeners[event] = this.#listeners[event]?.filter((existingListener) => listener !== existingListener);
    }
}

export abstract class PossiblyLedgerWalletAccount extends ReadonlyWalletAccount {
    abstract readonly ledger: boolean;
}

export class SignerWalletAccount extends PossiblyLedgerWalletAccount {
    get ledger() {
        return false;
    }

    constructor(account: WalletAccount) {
        super(account);
        if (new.target === SignerWalletAccount) {
            Object.freeze(this);
        }
    }
}

export class LedgerWalletAccount extends PossiblyLedgerWalletAccount {
    get ledger() {
        return true;
    }

    constructor(account: WalletAccount) {
        super(account);
        if (new.target === LedgerWalletAccount) {
            Object.freeze(this);
        }
    }
}
