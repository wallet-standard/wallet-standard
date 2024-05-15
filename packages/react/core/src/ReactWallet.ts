import type { Wallet } from '@wallet-standard/base';

import type { ReactWalletAccount } from './ReactWalletAccount.js';
import type { WalletHandle } from './WalletHandleRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js';

export type ReactWallet = WalletHandle &
    Readonly<
        Pick<Wallet, 'chains' | 'icon' | 'name' | 'version'> & {
            accounts: readonly ReactWalletAccount[];
        }
    >;
