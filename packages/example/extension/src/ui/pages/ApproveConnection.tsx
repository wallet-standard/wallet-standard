import type { FC } from 'react';
import React, { useState } from 'react';
import { condenseAddress } from '../../utils/address';
import { useAccounts } from '../hooks/useAccounts';
import { rpc } from '../rpc/index';

export type Network = 'ethereum' | 'solana';

export interface Account {
    network: Network;
    publicKey: Uint8Array;
}

let approveConnection: (accounts: Account[]) => void;
let denyConnection: () => void;
rpc.exposeMethod('connect', async () => {
    return new Promise((resolve) => {
        approveConnection = (accounts: Account[]) => {
            resolve(accounts);
        };
        denyConnection = () => {
            resolve(null);
        };
    });
});

export const ApproveConnection: FC = () => {
    const accounts = useAccounts();

    const [selectedAccounts, setSelectedAccounts] = useState(new Map<string, Account>());
    const hasSelectedAccounts = selectedAccounts.size > 0;

    const isAccountSelected = (address: string) => selectedAccounts.has(address);

    const handleAccountSelected = (address: string, selected: boolean) => {
        if (selected) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const account = accounts.find((account) => account.address === address)!;
            setSelectedAccounts((prevSelectedAccounts) => {
                prevSelectedAccounts.set(address, {
                    network: account.network,
                    publicKey: account.publicKey,
                });
                return new Map(prevSelectedAccounts.entries());
            });
        } else {
            setSelectedAccounts((prevSelectedAccounts) => {
                prevSelectedAccounts.delete(address);
                return new Map(prevSelectedAccounts.entries());
            });
        }
    };

    return (
        <div>
            <h1>Approve Connection</h1>
            <ul>
                {accounts.map((account) => (
                    <li key={account.address}>
                        <input
                            type="checkbox"
                            id={account.address}
                            checked={isAccountSelected(account.address)}
                            onChange={(event) => {
                                const address = event.target.value;
                                const selected = event.target.checked;
                                handleAccountSelected(address, selected);
                            }}
                            value={account.address}
                        />
                        <label htmlFor={account.address}>{condenseAddress(account.address)}</label>
                    </li>
                ))}
            </ul>
            <div>
                <button type="button" onClick={denyConnection}>
                    Deny
                </button>
                <button
                    type="button"
                    onClick={() => approveConnection([...selectedAccounts.values()])}
                    disabled={!hasSelectedAccounts}
                >
                    Approve
                </button>
            </div>
        </div>
    );
};
