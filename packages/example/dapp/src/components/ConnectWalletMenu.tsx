import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Button, Callout, DropdownMenu } from '@radix-ui/themes';
import { reactWalletAccountBelongsToReactWallet } from '@wallet-standard/react';
import { useWallets } from '@wallet-standard/react';
import React, { useContext, useRef, useState } from 'react';

import { SelectedWalletAccountContext } from '../context/SelectedWalletAccountContext';
import { ConnectWalletMenuItem } from './ConnectWalletMenuItem';
import { ErrorDialog } from './ErrorDialog';
import { WalletAccountIcon } from './WalletAccountIcon';

type Props = Readonly<{
    children: React.ReactNode;
}>;

export function ConnectWalletMenu({ children }: Props) {
    const { current: NO_ERROR } = useRef(Symbol());
    const wallets = useWallets();
    const [selectedWalletAccount, setSelectedWalletAccount] = useContext(SelectedWalletAccountContext);
    const [error, setError] = useState<typeof NO_ERROR | unknown>(NO_ERROR);
    const [forceClose, setForceClose] = useState(false);
    return (
        <>
            <DropdownMenu.Root open={forceClose ? false : undefined} onOpenChange={setForceClose.bind(null, false)}>
                <DropdownMenu.Trigger>
                    <Button>
                        {selectedWalletAccount ? (
                            <>
                                <WalletAccountIcon account={selectedWalletAccount} width="18" height="18" />
                                {selectedWalletAccount.address.slice(0, 8)}
                            </>
                        ) : (
                            children
                        )}
                        <DropdownMenu.TriggerIcon />
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                    {wallets.length === 0 ? (
                        <Callout.Root color="orange" highContrast>
                            <Callout.Icon>
                                <ExclamationTriangleIcon />
                            </Callout.Icon>
                            <Callout.Text>This browser has no wallets installed.</Callout.Text>
                        </Callout.Root>
                    ) : (
                        wallets.map((wallet) => (
                            <ConnectWalletMenuItem
                                key={`wallet:${wallet.name}`}
                                onAccountSelect={(account) => {
                                    setSelectedWalletAccount(account);
                                    setForceClose(true);
                                }}
                                onDisconnect={(wallet) => {
                                    if (
                                        selectedWalletAccount &&
                                        reactWalletAccountBelongsToReactWallet(selectedWalletAccount, wallet)
                                    ) {
                                        setSelectedWalletAccount(undefined);
                                    }
                                }}
                                onError={setError}
                                wallet={wallet}
                            />
                        ))
                    )}
                </DropdownMenu.Content>
            </DropdownMenu.Root>
            {error !== NO_ERROR ? <ErrorDialog error={error} onClose={() => setError(NO_ERROR)} /> : null}
        </>
    );
}
