import { useWallet, useWallets } from '@wallet-standard/react';
import type { FC } from 'react';
import React, { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';

export const Connect: FC = () => {
    const { wallets } = useWallets();
    const { connect, setWallet, wallet } = useWallet();

    useEffect(() => {
        async function connectOrDeselect() {
            try {
                await connect();
            } catch (err) {
                setWallet(undefined);
            }
        }

        if (wallet) {
            connectOrDeselect();
        }
    }, [wallet, connect, setWallet]);

    const isConnected = !!wallet?.accounts?.length;
    if (isConnected) {
        return <Navigate to="/" replace={true} />;
    }

    return (
        <div>
            <h1>Connect Wallet</h1>
            <Link to="/">Back</Link>
            <ul>
                {wallets.map((wallet, index) => (
                    <li key={index}>
                        {wallet.name}
                        <button type="button" onClick={() => setWallet(wallet)}>
                            Select
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};
