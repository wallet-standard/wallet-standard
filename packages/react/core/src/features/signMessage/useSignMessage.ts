import type { SignMessageMethod } from '@wallet-standard/experimental-features';
import { createContext, useContext } from 'react';
import { createDefaultContext } from '../../context.js';

/** TODO: docs */
export interface SignMessageContextState {
    waiting: boolean;
    signMessage: SignMessageMethod | undefined;
}

const DEFAULT_SIGN_MESSAGE_STATE: Readonly<SignMessageContextState> = {
    waiting: false,
    signMessage: undefined,
} as const;

const DEFAULT_SIGN_MESSAGE_CONTEXT = createDefaultContext('SignMessage', DEFAULT_SIGN_MESSAGE_STATE);

/** TODO: docs */
export const SignMessageContext = createContext(DEFAULT_SIGN_MESSAGE_CONTEXT);

/** TODO: docs */
export function useSignMessage(): SignMessageContextState {
    return useContext(SignMessageContext);
}
