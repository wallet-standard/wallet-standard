import type { SignTransactionMethod } from '@wallet-standard/experimental-features';
import { createContext, useContext } from 'react';
import { createDefaultContext } from '../../context.js';

/** TODO: docs */
export interface SignTransactionContextState {
    waiting: boolean;
    signTransaction: SignTransactionMethod | undefined;
}

const DEFAULT_SIGN_TRANSACTION_STATE: Readonly<SignTransactionContextState> = {
    waiting: false,
    signTransaction: undefined,
} as const;

const DEFAULT_SIGN_TRANSACTION_CONTEXT = createDefaultContext('SignTransaction', DEFAULT_SIGN_TRANSACTION_STATE);

/** TODO: docs */
export const SignTransactionContext = createContext(DEFAULT_SIGN_TRANSACTION_CONTEXT);

/** TODO: docs */
export function useSignTransaction(): SignTransactionContextState {
    return useContext(SignTransactionContext);
}
