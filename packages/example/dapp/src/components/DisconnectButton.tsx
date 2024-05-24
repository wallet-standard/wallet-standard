import { Button, Tooltip } from '@radix-ui/themes';
import { ExclamationTriangleIcon, ExitIcon } from '@radix-ui/react-icons';
import type { ReactWallet } from '@wallet-standard/react';
import { useDisconnect } from '@wallet-standard/react';
import React, { useState } from 'react';

import { NO_ERROR } from '../errors';

type Props = Readonly<{
    wallet: ReactWallet;
}>;

export function DisconnectButton({
    wallet,
    ...buttonProps
}: Props & Omit<React.ComponentProps<typeof Button>, 'color' | 'loading' | 'onClick'>) {
    const [isDisconnecting, disconnect] = useDisconnect(wallet);
    const [lastError, setLastError] = useState<typeof NO_ERROR | unknown>(NO_ERROR);
    return (
        <Tooltip
            content={
                <>
                    Error:{' '}
                    {lastError && typeof lastError === 'object' && 'message' in lastError
                        ? // @ts-ignore
                          lastError.message
                        : String(lastError)}
                </>
            }
            open={lastError !== NO_ERROR}
            side="left"
        >
            <Button
                {...buttonProps}
                color="red"
                loading={isDisconnecting}
                onClick={async () => {
                    setLastError(NO_ERROR);
                    try {
                        await disconnect();
                    } catch (e) {
                        setLastError(e);
                    }
                }}
                variant="outline"
            >
                {lastError === NO_ERROR ? <ExitIcon /> : <ExclamationTriangleIcon />}
                Disconnect
            </Button>
        </Tooltip>
    );
}
