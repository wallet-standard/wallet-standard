import { Wallet, WalletAccount, WalletsCommand, WalletsEventNames, WalletsEvents, WalletsWindow } from './types';

declare const window: WalletsWindow<WalletAccount>;

export function initialize(): void {
    const commands = (window.wallets = window.wallets || []);

    if (Array.isArray(commands)) {
        const wallets: Wallet<WalletAccount>[] = [];
        const listeners: { [E in WalletsEventNames<WalletAccount>]?: WalletsEvents<WalletAccount>[E][] } = {};

        function push(...commands: WalletsCommand<WalletAccount>[]): void {
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

        window.wallets = { push };
        push(...commands);
    }
}
