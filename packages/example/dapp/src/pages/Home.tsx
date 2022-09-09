import { useWallet } from '@wallet-standard/react';
import type { FC } from 'react';
import React from 'react';
import { Link } from 'react-router-dom';

export const Home: FC = () => {
    const { wallet } = useWallet();

    const isConnected = !!wallet?.accounts?.length;

    return (
        <div>
            <h1>dApp Example</h1>
            {!isConnected && <Link to="/connect">Connect Wallet</Link>}
        </div>
    );
};
