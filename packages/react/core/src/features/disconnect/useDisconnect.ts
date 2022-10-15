import type { DisconnectMethod } from '@wallet-standard/features';
import { createContext, useContext } from 'react';
import { createDefaultContext } from '../../context.js';

/** TODO: docs */
export interface DisconnectContextState {
    waiting: boolean;
    disconnect: DisconnectMethod | undefined;
}

const DEFAULT_DISCONNECT_STATE: Readonly<DisconnectContextState> = {
    waiting: false,
    disconnect: undefined,
} as const;

const DEFAULT_DISCONNECT_CONTEXT = createDefaultContext('Disconnect', DEFAULT_DISCONNECT_STATE);

/** TODO: docs */
export const DisconnectContext = createContext(DEFAULT_DISCONNECT_CONTEXT);

/** TODO: docs */
export function useDisconnect(): DisconnectContextState {
    return useContext(DisconnectContext);
}
