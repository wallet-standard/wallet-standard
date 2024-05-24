import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Spinner, Avatar, DropdownMenu, Text, ThickChevronRightIcon } from '@radix-ui/themes';
import type { ReactWalletAccount, ReactWallet } from '@wallet-standard/react';
import { useConnect, useDisconnect } from '@wallet-standard/react';
import React, { useCallback, useContext } from 'react';
import { SelectedWalletAccountContext } from '../context/SelectedWalletAccountContext';

type Props = Readonly<{
    onAccountSelect(account: ReactWalletAccount | undefined): void;
    onDisconnect(wallet: ReactWallet): void;
    onError(err: unknown): void;
    wallet: ReactWallet;
}>;

export function ConnectWalletMenuItem({ onAccountSelect, onDisconnect, onError, wallet }: Props) {
    const [isConnecting, connect] = useConnect(wallet);
    const [isDisconnecting, disconnect] = useDisconnect(wallet);
    const isPending = isConnecting || isDisconnecting;
    const isConnected = wallet.accounts.length > 0;
    const [selectedWalletAccount] = useContext(SelectedWalletAccountContext);
    const handleClick = useCallback(async () => {
        try {
            if (isConnected) {
                await disconnect();
                onDisconnect(wallet);
            } else {
                const accounts = await connect();
                if (accounts[0]) {
                    onAccountSelect(accounts[0]);
                }
            }
        } catch (e) {
            onError(e);
        }
    }, [connect, disconnect, isConnected, onAccountSelect, onDisconnect, onError, wallet]);
    const menuItemContent = (
        <>
            <Spinner loading={isPending}>
                <Avatar
                    fallback={<Text size="1">{wallet.name.slice(0, 1)}</Text>}
                    radius="none"
                    src={wallet.icon}
                    style={{ height: 18, width: 18 }}
                />
            </Spinner>
            {wallet.name}
        </>
    );
    return (
        <DropdownMenu.Sub open={!isConnected ? false : undefined}>
            <DropdownMenuPrimitive.SubTrigger
                asChild={false}
                className={[
                    'rt-BaseMenuItem',
                    'rt-BaseMenuSubTrigger',
                    'rt-DropdownMenuItem',
                    'rt-DropdownMenuSubTrigger',
                ].join(' ')}
                disabled={isPending}
                onClick={!isConnected ? handleClick : undefined}
            >
                {menuItemContent}
                {isConnected ? (
                    <div className="rt-BaseMenuShortcut rt-DropdownMenuShortcut">
                        <ThickChevronRightIcon className="rt-BaseMenuSubTriggerIcon rt-DropdownMenuSubtriggerIcon" />
                    </div>
                ) : null}
            </DropdownMenuPrimitive.SubTrigger>
            <DropdownMenu.SubContent>
                <DropdownMenu.Label>Accounts</DropdownMenu.Label>
                <DropdownMenu.RadioGroup value={selectedWalletAccount?.address}>
                    {wallet.accounts.map((account) => (
                        <DropdownMenu.RadioItem
                            key={account.address}
                            value={account.address}
                            onSelect={() => {
                                onAccountSelect(account);
                            }}
                        >
                            {account.address.slice(0, 8)}&hellip;
                        </DropdownMenu.RadioItem>
                    ))}
                </DropdownMenu.RadioGroup>
                <DropdownMenu.Separator />
                <DropdownMenu.Item
                    color="red"
                    onSelect={async (e) => {
                        e.preventDefault();
                        try {
                            await disconnect();
                            onDisconnect(wallet);
                        } catch (e) {
                            onError(e);
                        }
                    }}
                >
                    Disconnect
                </DropdownMenu.Item>
            </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
    );
}
