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

    const commands = (window.navigator.wallets = window.navigator.wallets || []);
    // If it's already initialized, just return it.
    if (!Array.isArray(commands)) return commands;

    const registered: Wallet<Account>[] = [];
    const listeners: { [E in WalletsEventNames<Account>]?: WalletsEvents<Account>[E][] } = {};
    const wallets = (window.navigator.wallets = { push });

    push(...commands);

    function push(...commands: WalletsCommand<Account>[]): void {
        for (const command of commands) {
            switch (command.method) {
                case 'get':
                    {
                        const { callback } = command;
                        // Return a copy so the registered wallets can't be referenced or mutated.
                        callback(registered.slice());
                    }
                    break;
                case 'register':
                    {
                        const { wallets, callback } = command;
                        registered.push(...wallets);
                        listeners['register']?.forEach((listener) => listener(...wallets));
                        // Return a function that unregisters the registered wallets.
                        callback(function unregister(): void {
                            wallets
                                .map((wallet) => registered.indexOf(wallet))
                                .filter((index) => index !== -1)
                                .sort()
                                .reverse()
                                .forEach((index) => registered.splice(index, 1));
                            listeners['unregister']?.forEach((listener) => listener(...wallets));
                        });
                    }
                    break;
                case 'on':
                    {
                        const { event, listener, callback } = command;
                        listeners[event]?.push(listener) || (listeners[event] = [listener]);
                        // Return a function that removes the event listener.
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
