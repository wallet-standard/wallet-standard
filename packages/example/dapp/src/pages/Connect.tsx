import { useConnect, useWallet, useWallets } from '@wallet-standard/react';
import type { FC } from 'react';
import React, { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useIsConnected } from '../hooks/useIsConnected';

export const Connect: FC = () => {
    const { wallets } = useWallets();
    const { setWallet, wallet } = useWallet();
    const isConnected = useIsConnected();
    const { connect } = useConnect();

    useEffect(() => {
        async function connectOrDeselect() {
            try {
                await connect?.();
            } catch (err: any) {
                const didUserReject = err.code === 4001;
                if (!didUserReject) {
                    throw err;
                }

                setWallet(null);
            }
        }

        if (wallet && connect && !isConnected) {
            connectOrDeselect();
        }
    }, [wallet, connect, isConnected, setWallet]);

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
