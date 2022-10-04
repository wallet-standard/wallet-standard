import type { Wallet, WalletEventName, WalletEvent } from '@wallet-standard/standard';
import { ReadonlyWalletAccount } from '@wallet-standard/util';

export abstract class AbstractWallet implements Wallet {
    #listeners: { [E in WalletEventName]?: WalletEvent[E][] } = {};

    protected _accounts: ReadonlyWalletAccount[];

    get version() {
        return '1.0.0' as const;
    }

    abstract get name(): Wallet['name'];
    abstract get icon(): Wallet['icon'];
    abstract get chains(): Wallet['chains'];
    abstract get features(): Wallet['features'];
    abstract get events(): Wallet['events'];

    get accounts() {
        return this._accounts.slice();
    }

    constructor(accounts: ReadonlyWalletAccount[]) {
        this._accounts = accounts;
    }

    on<E extends WalletEventName>(event: E, listener: WalletEvent[E]): () => void {
        this.#listeners[event]?.push(listener) || (this.#listeners[event] = [listener]);
        return (): void => this.#off(event, listener);
    }

    protected _emit<E extends WalletEventName>(event: E, ...args: Parameters<WalletEvent[E]>): void {
        // eslint-disable-next-line prefer-spread
        this.#listeners[event]?.forEach((listener) => listener.apply(null, args));
    }

    #off<E extends WalletEventName>(event: E, listener: WalletEvent[E]): void {
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
}

export class LedgerWalletAccount extends PossiblyLedgerWalletAccount {
    get ledger() {
        return true;
    }
}
