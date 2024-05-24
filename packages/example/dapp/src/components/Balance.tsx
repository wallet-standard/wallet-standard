import { Text } from '@radix-ui/themes';
import { address } from '@solana/web3.js-experimental';
import type { ReactWalletAccount } from '@wallet-standard/react';
import React, { useContext, useEffect, useState } from 'react';
import { Await, useAsyncValue } from 'react-router-dom';
import { RpcContext } from '../context/RpcContext';

type Props = Readonly<{
    account: ReactWalletAccount;
}>;

export function Balance({ account }: Props) {
    const [balancePromise, setBalancePromise] = useState<Promise<bigint> | undefined>();
    const { rpc } = useContext(RpcContext);
    // FIXME: This is the render-then-fetch pattern. Bad. Fetch as you render!
    useEffect(() => {
        setBalancePromise(
            rpc
                .getBalance(address(account.address), { commitment: 'confirmed' })
                .send()
                .then(({ value }) => value)
        );
    }, [account.address, rpc]);
    return (
        <Await resolve={balancePromise} errorElement={<Text>&ndash;</Text>}>
            <BalanceImpl />
        </Await>
    );
}

function BalanceImpl() {
    const lamports = useAsyncValue() as bigint;
    const formattedSolValue = new Intl.NumberFormat(undefined, { maximumFractionDigits: 5 }).format(
        // @ts-ignore This format string is 100% allowed now.
        `${lamports}E-9`
    );
    return <Text>{`${formattedSolValue} \u25CE`}</Text>;
}
