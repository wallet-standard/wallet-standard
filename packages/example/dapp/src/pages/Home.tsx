import { useWallet } from '@wallet-standard/react';
import type { FC } from 'react';
import React from 'react';
import { Link } from 'react-router-dom';

const Disconnected: FC = () => {
    return <Link to="/connect">Connect Wallet</Link>;
};

const Connected: FC = () => {
    const { accounts } = useWallet();

    return (
        <ul>
            {accounts.map((account, index) => (
                <li key={index}>{account.address}</li>
            ))}
        </ul>
    );
};

export const Home: FC = () => {
    const { wallet } = useWallet();

    const isConnected = !!wallet?.accounts?.length;

    return (
        <div>
            <h1>dApp Example</h1>
            {isConnected ? <Connected /> : <Disconnected />}
        </div>
    );
};
