import type { Wallet } from '@wallet-standard/base';
import type { DisconnectFeature, DisconnectMethod } from '@wallet-standard/features';
import type { FC, ReactNode } from 'react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useWallet } from '../../useWallet.js';
import { DisconnectContext } from './useDisconnect.js';

/** TODO: docs */
export interface DisconnectProviderProps {
    children: NonNullable<ReactNode>;
    onError?: (error: Error) => void;
}

/** TODO: docs */
export function hasDisconnectFeature(features: Wallet['features']): features is DisconnectFeature {
    return 'standard:disconnect' in features;
}

/** TODO: docs */
export const DisconnectProvider: FC<DisconnectProviderProps> = ({ children, onError }) => {
    const { features } = useWallet();

    // Handle errors, logging them by default.
    const handleError = useCallback(
        (error: Error) => {
            (onError || console.error)(error);
            return error;
        },
        [onError]
    );

    // Disconnect from the wallet.
    const [waiting, setWaiting] = useState(false);
    const promise = useRef<ReturnType<DisconnectMethod>>();
    const disconnect = useMemo<DisconnectMethod | undefined>(
        () =>
            hasDisconnectFeature(features)
                ? async () => {
                      // If already waiting, wait for that promise to resolve.
                      if (promise.current) {
                          try {
                              await promise.current;
                          } catch (error: any) {
                              // Error will already have been handled below.
                          }
                      }

                      setWaiting(true);
                      try {
                          promise.current = features['standard:disconnect'].disconnect();
                          return await promise.current;
                      } catch (error: any) {
                          throw handleError(error);
                      } finally {
                          setWaiting(false);
                          promise.current = undefined;
                      }
                  }
                : undefined,
        [features, promise, handleError]
    );

    return (
        <DisconnectContext.Provider
            value={{
                waiting,
                disconnect,
            }}
        >
            {children}
        </DisconnectContext.Provider>
    );
};
