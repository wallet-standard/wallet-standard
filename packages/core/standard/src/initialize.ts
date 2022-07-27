import {
    Wallet,
    WalletAccount,
    Wallets,
    WalletsCommand,
    WalletsEventNames,
    WalletsEvents,
    WalletsWindow,
} from './types';

declare const window: WalletsWindow<any>;

export function initialize<Account extends WalletAccount>(): Wallets<Account> {
    if (typeof window === 'undefined') return [];

    const commands = (window.wallets = window.wallets || []);
    // If it's already initialized, just return it
    if (!Array.isArray(commands)) return commands;

    const registered: Wallet<Account>[] = [];
    const listeners: { [E in WalletsEventNames<Account>]?: WalletsEvents<Account>[E][] } = {};
    const wallets = (window.wallets = { push });

    push(...commands);

    function push(...commands: WalletsCommand<Account>[]): void {
        for (const command of commands) {
            switch (command.method) {
                case 'get':
                    {
                        const { callback } = command;
                        // Return a copy so the original can't be referenced or mutated.
                        callback([...registered]);
                    }
                    break;
                case 'register':
                    {
                        const { wallets } = command;
                        registered.push(...wallets);
                        listeners['register']?.forEach((listener) => listener(...wallets));
                    }
                    break;
                case 'on':
                    {
                        const { event, listener, callback } = command;
                        listeners[event]?.push(listener) || (listeners[event] = [listener]);
                        callback(function off(): void {
                            listeners[event] = listeners[event]?.filter(
                                (existingListener) => listener !== existingListener
                            );
                        });
                    }
                    break;
            }
        }
    }

    return wallets;
}
