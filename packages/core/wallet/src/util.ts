import type { ReadonlyUint8Array, WalletAccount } from '@wallet-standard/base';

/**
 * Base implementation of a {@link "@wallet-standard/base".WalletAccount} to be used or extended by a
 * {@link "@wallet-standard/base".Wallet}.
 *
 * `WalletAccount` properties must be read-only. This class enforces this by making all properties
 * [truly private](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields) and
 * read-only, using getters for access, returning copies instead of references, and calling
 * [Object.freeze](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)
 * on the instance.
 *
 * @group Account
 */
export class ReadonlyWalletAccount implements WalletAccount {
    readonly #address: WalletAccount['address'];
    readonly #publicKey: WalletAccount['publicKey'];
    readonly #chains: WalletAccount['chains'];
    readonly #features: WalletAccount['features'];
    readonly #label: WalletAccount['label'];
    readonly #icon: WalletAccount['icon'];

    /** Implementation of {@link "@wallet-standard/base".WalletAccount.address | WalletAccount::address} */
    get address() {
        return this.#address;
    }

    /** Implementation of {@link "@wallet-standard/base".WalletAccount.publicKey | WalletAccount::publicKey} */
    get publicKey() {
        return this.#publicKey.slice();
    }

    /** Implementation of {@link "@wallet-standard/base".WalletAccount.chains | WalletAccount::chains} */
    get chains() {
        return this.#chains.slice();
    }

    /** Implementation of {@link "@wallet-standard/base".WalletAccount.features | WalletAccount::features} */
    get features() {
        return this.#features.slice();
    }

    /** Implementation of {@link "@wallet-standard/base".WalletAccount.label | WalletAccount::label} */
    get label() {
        return this.#label;
    }

    /** Implementation of {@link "@wallet-standard/base".WalletAccount.icon | WalletAccount::icon} */
    get icon() {
        return this.#icon;
    }

    /**
     * Create and freeze a read-only account.
     *
     * @param account Account to copy properties from.
     */
    constructor(account: WalletAccount) {
        if (new.target === ReadonlyWalletAccount) {
            Object.freeze(this);
        }

        this.#address = account.address;
        this.#publicKey = account.publicKey.slice();
        this.#chains = account.chains.slice();
        this.#features = account.features.slice();
        this.#label = account.label;
        this.#icon = account.icon;
    }
}

/**
 * Efficiently compare {@link Indexed} arrays (e.g. `Array` and `Uint8Array`).
 *
 * @param a An array.
 * @param b Another array.
 *
 * @return `true` if the arrays have the same length and elements, `false` otherwise.
 *
 * @group Util
 */
export function arraysEqual<T>(a: Indexed<T>, b: Indexed<T>): boolean {
    if (a === b) return true;

    const length = a.length;
    if (length !== b.length) return false;

    for (let i = 0; i < length; i++) {
        if (a[i] !== b[i]) return false;
    }

    return true;
}

/**
 * Efficiently compare byte arrays, using {@link arraysEqual}.
 *
 * @param a A byte array.
 * @param b Another byte array.
 *
 * @return `true` if the byte arrays have the same length and bytes, `false` otherwise.
 *
 * @group Util
 */
export function bytesEqual(a: ReadonlyUint8Array, b: ReadonlyUint8Array): boolean {
    return arraysEqual(a, b);
}

/**
 * Efficiently concatenate byte arrays without modifying them.
 *
 * @param first  A byte array.
 * @param others Additional byte arrays.
 *
 * @return New byte array containing the concatenation of all the byte arrays.
 *
 * @group Util
 */
export function concatBytes(first: ReadonlyUint8Array, ...others: ReadonlyUint8Array[]): Uint8Array {
    const length = others.reduce((length, bytes) => length + bytes.length, first.length);
    const bytes = new Uint8Array(length);

    bytes.set(first, 0);
    for (const other of others) {
        bytes.set(other, bytes.length);
    }

    return bytes;
}

/**
 * Create a new object with a subset of fields from a source object.
 *
 * @param source Object to pick fields from.
 * @param keys   Names of fields to pick.
 *
 * @return New object with only the picked fields.
 *
 * @group Util
 */
export function pick<T, K extends keyof T>(source: T, ...keys: K[]): Pick<T, K> {
    const picked = {} as Pick<T, K>;
    for (const key of keys) {
        picked[key] = source[key];
    }
    return picked;
}

/**
 * Call a callback function, catch an error if it throws, and log the error without rethrowing.
 *
 * @param callback Function to call.
 *
 * @group Util
 */
export function guard(callback: () => void) {
    try {
        callback();
    } catch (error) {
        console.error(error);
    }
}

/**
 * @internal
 *
 * Type with a numeric `length` and numerically indexed elements of a generic type `T`.
 *
 * For example, `Array<T>` and `Uint8Array`.
 *
 * @group Internal
 */
export interface Indexed<T> {
    length: number;
    [index: number]: T;
}
