import type { Wallet } from '@wallet-standard/base';

import type { UiWalletAccount } from './UiWalletAccount.js';
import type { UiWalletHandle } from './UiWalletHandle.js';

/**
 * Represents a `Wallet` in a client application. It acts as a 'handle' to the underlying `Wallet`
 * instance in the Wallet Standard registry, and contains a subset of its properties.
 *
 * You can pass objects of this type around your application, use its `icon` and `name` for display,
 * inspect its `chains` and `features`, and enumerate the `accounts` for which your application has
 * been granted authorization to use.
 */
export type UiWallet = UiWalletHandle &
    Readonly<
        Pick<Wallet, 'chains' | 'icon' | 'name' | 'version'> & {
            accounts: readonly UiWalletAccount[];
        }
    >;
