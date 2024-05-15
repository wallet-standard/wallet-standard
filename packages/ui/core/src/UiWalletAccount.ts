import type { ReadonlyUint8Array, WalletAccount } from '@wallet-standard/base';

import type { UiWalletHandle } from './UiWalletHandle.js';

/**
 * Represents a `WalletAccount` in a client application. It acts as a 'handle' to the underlying
 * `WalletAccount` instance in the Wallet Standard registry, and contains a subset of its
 * properties.
 */
export type UiWalletAccount = UiWalletHandle &
    Pick<WalletAccount, 'address' | 'chains' | 'icon' | 'label'> &
    Readonly<{
        publicKey: ReadonlyUint8Array;
    }>;
