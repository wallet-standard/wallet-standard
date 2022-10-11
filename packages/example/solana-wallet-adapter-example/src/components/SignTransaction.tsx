import { Button } from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import bs58 from 'bs58';
import type { FC } from 'react';
import React, { useCallback } from 'react';
import { useNotify } from './notify';

export const SignTransaction: FC = () => {
    const { connection } = useConnection();
    const { publicKey, signTransaction } = useWallet();
    const notify = useNotify();

    const onClick = useCallback(async () => {
        try {
            if (!publicKey) {
                notify('error', 'Wallet not connected!');
                return;
            }
            if (!signTransaction) {
                notify('error', 'Wallet does not support transaction signing!');
                return;
            }
            const {
                context: { slot: minContextSlot },
                value: { blockhash, lastValidBlockHeight },
            } = await connection.getLatestBlockhashAndContext();

            const transaction = new Transaction({
                feePayer: publicKey,
                blockhash,
                lastValidBlockHeight,
            }).add(
                new TransactionInstruction({
                    data: Buffer.from('Hello, from the Solana Wallet Adapter example app!'),
                    keys: [],
                    programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
                })
            );

            const signedTransaction = await signTransaction(transaction);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            notify('success', `Transaction signature: ${bs58.encode(signedTransaction.signature!)}`);
        } catch (error: any) {
            notify('error', `Signing failed: ${error?.message}`);
        }
    }, [publicKey, notify, signTransaction, connection]);

    return signTransaction ? (
        <Button variant="contained" color="secondary" onClick={onClick} disabled={!publicKey}>
            Sign Transaction
        </Button>
    ) : null;
};
