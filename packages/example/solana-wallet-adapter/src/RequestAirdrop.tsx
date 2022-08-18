import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import type { TransactionSignature } from '@solana/web3.js';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import type { FC } from 'react';
import React, { useCallback } from 'react';

export const RequestAirdrop: FC = () => {
    const { connection } = useConnection();
    const { publicKey } = useWallet();

    const onClick = useCallback(async () => {
        if (!publicKey) {
            console.error('Wallet not connected!');
            return;
        }

        let signature: TransactionSignature = '';
        try {
            signature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
            console.info('Airdrop requested:', signature);

            await connection.confirmTransaction(signature, 'processed');
            console.info('Airdrop successful!', signature);
        } catch (error: any) {
            console.error(`Airdrop failed! ${error?.message}`, signature);
        }
    }, [publicKey, connection]);

    return (
        <button onClick={onClick} disabled={!publicKey}>
            Request Airdrop
        </button>
    );
};
