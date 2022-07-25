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
    let commands: Wallets<Account> = (window.wallets = window.wallets || []);

    if (Array.isArray(commands)) {
        const wallets: Wallet<Account>[] = [];
        const listeners: { [E in WalletsEventNames<Account>]?: WalletsEvents<Account>[E][] } = {};

        function push(...commands: WalletsCommand<Account>[]): void {
            for (const command of commands) {
                switch (command.method) {
                    case 'get':
                        {
                            const { callback } = command;
                            callback(wallets);
                        }
                        break;
                    case 'register':
                        {
                            const { wallets: newWallets } = command;
                            wallets.push(...newWallets);
                            listeners['register']?.forEach((listener) => listener(...newWallets));
                        }
                        break;
                    case 'on':
                        {
                            const { event, listener: newListener, callback } = command;
                            listeners[event]?.push(newListener) || (listeners[event] = [newListener]);
                            callback(function (): void {
                                listeners[event] = listeners[event]?.filter((listener) => newListener !== listener);
                            });
                        }
                        break;
                }
            }
        }

        push(...commands);
        commands = window.wallets = { push };
    }

    return commands;
}
