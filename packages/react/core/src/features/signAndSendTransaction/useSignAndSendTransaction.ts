import type { SignAndSendTransactionMethod } from '@wallet-standard/experimental-features';
import { createContext, useContext } from 'react';
import { createDefaultContext } from '../../context.js';

/** TODO: docs */
export interface SignAndSendTransactionContextState {
    waiting: boolean;
    signAndSendTransaction: SignAndSendTransactionMethod | undefined;
}

const DEFAULT_SIGN_AND_SEND_TRANSACTION_STATE: Readonly<SignAndSendTransactionContextState> = {
    waiting: false,
    signAndSendTransaction: undefined,
} as const;

const DEFAULT_SIGN_AND_SEND_TRANSACTION_CONTEXT = createDefaultContext(
    'SignAndSendTransaction',
    DEFAULT_SIGN_AND_SEND_TRANSACTION_STATE
);

/** TODO: docs */
export const SignAndSendTransactionContext = createContext(DEFAULT_SIGN_AND_SEND_TRANSACTION_CONTEXT);

/** TODO: docs */
export function useSignAndSendTransaction(): SignAndSendTransactionContextState {
    return useContext(SignAndSendTransactionContext);
}
