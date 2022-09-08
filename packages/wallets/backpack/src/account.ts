import type {
    IdentifierArray,
    WalletAccount,
    WalletAccountEventNames,
    WalletAccountEvents,
} from '@wallet-standard/standard';
import type { SolanaChain } from '@wallet-standard/util';

export class BackpackSolanaWalletAccount implements WalletAccount {
    readonly #listeners: { [E in WalletAccountEventNames]?: WalletAccountEvents[E][] } = {};
    readonly #address: string;
    readonly #publicKey: Uint8Array;
    readonly #chains: ReadonlyArray<SolanaChain>;
    readonly #features: IdentifierArray;

    get address() {
        return this.#address;
    }

    get publicKey() {
        return this.#publicKey;
    }

    get chains() {
        return [...this.#chains];
    }

    get features() {
        return [...this.#features];
    }

    constructor(address: string, publicKey: Uint8Array, chains: ReadonlyArray<SolanaChain>, features: IdentifierArray) {
        this.#address = address;
        this.#publicKey = publicKey;
        this.#chains = chains;
        this.#features = features;
    }

    on<E extends WalletAccountEventNames>(event: E, listener: WalletAccountEvents[E]): () => void {
        this.#listeners[event]?.push(listener) || (this.#listeners[event] = [listener]);
        return (): void => this.#off(event, listener);
    }

    #emit<E extends WalletAccountEventNames>(event: E, ...args: Parameters<WalletAccountEvents[E]>): void {
        // eslint-disable-next-line prefer-spread
        this.#listeners[event]?.forEach((listener) => listener.apply(null, args));
    }

    #off<E extends WalletAccountEventNames>(event: E, listener: WalletAccountEvents[E]): void {
        this.#listeners[event] = this.#listeners[event]?.filter((existingListener) => listener !== existingListener);
    }
}
