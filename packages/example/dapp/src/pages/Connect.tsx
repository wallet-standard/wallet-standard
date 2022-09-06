import type { FC } from 'react';
import React from 'react';
import { Link } from 'react-router-dom';

export const Connect: FC = () => {
    return (
        <div>
            <h1>Connect Wallet</h1>
            <Link to="/">Back</Link>
        </div>
    );
};
