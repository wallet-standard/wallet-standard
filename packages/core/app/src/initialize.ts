import {
    Wallet,
    WalletAccount,
    Wallets,
    WalletsCommand,
    WalletsEventNames,
    WalletsEvents,
    WalletsWindow,
} from '@wallet-standard/standard';

/** TODO: docs */
export function initialize<Account extends WalletAccount>(): Wallets<Account> {
    if (typeof window === 'undefined') return create<Account>();

    const commands = ((window as WalletsWindow<Account>).navigator.wallets ||= []);
    // If it's already initialized, don't recreate it, just return it.
    if (!Array.isArray(commands)) return commands;

    const wallets = create<Account>();
    Object.defineProperty(window.navigator, 'wallets', { value: wallets });
    wallets.push(...commands);
    return wallets;
}

function create<Account extends WalletAccount>(): Wallets<Account> {
    const registered: Wallet<Account>[] = [];
    const listeners: { [E in WalletsEventNames<Account>]?: WalletsEvents<Account>[E][] } = {};

    function register(wallets: ReadonlyArray<Wallet<Account>>): () => void {
        registered.push(...wallets);
        listeners['register']?.forEach((listener) => listener(wallets));
        // Return a function that unregisters the registered wallets.
        return function unregister(): void {
            wallets
                .map((wallet) => registered.indexOf(wallet))
                .filter((index) => index !== -1)
                .sort()
                .reverse()
                .forEach((index) => registered.splice(index, 1));
            listeners['unregister']?.forEach((listener) => listener(wallets));
        };
    }

    function get(): ReadonlyArray<Wallet<Account>> {
        // Return a copy so the registered wallets can't be referenced or mutated.
        return registered.slice();
    }

    function on<E extends WalletsEventNames<Account> = WalletsEventNames<Account>>(
        event: E,
        listener: WalletsEvents<Account>[E]
    ): () => void {
        listeners[event]?.push(listener) || (listeners[event] = [listener]);
        // Return a function that removes the event listener.
        return function off(): void {
            listeners[event] = listeners[event]?.filter((existingListener) => listener !== existingListener);
        };
    }

    function push(...commands: WalletsCommand<Account>[]): void {
        for (const command of commands) {
            switch (command.method) {
                case 'get':
                    {
                        const { callback } = command;
                        callback(get());
                    }
                    break;
                case 'register':
                    {
                        const { wallets, callback } = command;
                        callback(register(wallets));
                    }
                    break;
                case 'on':
                    {
                        const { event, listener, callback } = command;
                        callback(on(event, listener));
                    }
                    break;
                default:
                    console.warn(
                        `\`window.navigator.wallets.push(...)\` called with unknown command \`${JSON.stringify(
                            command
                        )}\``
                    );
                    break;
            }
        }
    }

    return { push, get, register, on };
}
