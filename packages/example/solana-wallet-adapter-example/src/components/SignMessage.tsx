import { Button } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import type { FC } from 'react';
import React, { useCallback } from 'react';
import { sign } from 'tweetnacl';
import { useNotify } from './notify';

export const SignMessage: FC = () => {
    const { publicKey, signMessage } = useWallet();
    const notify = useNotify();

    const onClick = useCallback(async () => {
        try {
            if (!publicKey) {
                notify('error', 'Wallet not connected!');
                return;
            }
            if (!signMessage) {
                notify('error', 'Wallet does not support message signing!');
                return;
            }

            // Encode anything as bytes
            const message = new TextEncoder().encode('Hello, world!');
            // Sign the bytes using the wallet
            const signature = await signMessage(message);
            // Verify that the bytes were signed using the private key that matches the known public key
            if (!sign.detached.verify(message, signature, publicKey.toBytes())) throw new Error('Invalid signature!');

            notify('success', `Message signature: ${bs58.encode(signature)}`);
        } catch (error: any) {
            notify('error', `Signing failed: ${error?.message}`);
        }
    }, [publicKey, notify, signMessage]);

    return signMessage ? (
        <Button variant="contained" color="secondary" onClick={onClick} disabled={!publicKey}>
            Sign Message
        </Button>
    ) : null;
};
