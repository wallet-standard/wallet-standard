import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import type { TransactionSignature } from '@solana/web3.js';
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import type { FC } from 'react';
import React, { useCallback } from 'react';

export const SendTransaction: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const onClick = useCallback(async () => {
        if (!publicKey) {
            console.error('Wallet not connected!');
            return;
        }

        let signature: TransactionSignature = '';
        try {
            const transaction = new Transaction().add(
                new TransactionInstruction({
                    data: Buffer.from('Hello, from the Solana Wallet Adapter example app!'),
                    keys: [],
                    programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
                })
            );

            signature = await sendTransaction(transaction, connection);
            console.info('Transaction sent:', signature);

            await connection.confirmTransaction(signature, 'processed');
            console.info('Transaction successful!', signature);
        } catch (error: any) {
            console.error(`Transaction failed! ${error?.message}`, signature);
            return;
        }
    }, [publicKey, connection, sendTransaction]);

    return (
        <button onClick={onClick} disabled={!publicKey}>
            Send Transaction (devnet)
        </button>
    );
};
