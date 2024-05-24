import type { ReactWalletAccount } from '@wallet-standard/react';
import { useWallets, reactWalletAccountBelongsToReactWallet } from '@wallet-standard/react';
import React from 'react';

type Props = React.ComponentProps<'img'> &
    Readonly<{
        account: ReactWalletAccount;
    }>;

export function WalletAccountIcon({ account, ...imgProps }: Props) {
    const wallets = useWallets();
    let icon;
    if (account.icon) {
        icon = account.icon;
    } else {
        for (const wallet of wallets) {
            if (reactWalletAccountBelongsToReactWallet(account, wallet)) {
                icon = wallet.icon;
                break;
            }
        }
    }
    return icon ? <img src={icon} {...imgProps} /> : null;
}
