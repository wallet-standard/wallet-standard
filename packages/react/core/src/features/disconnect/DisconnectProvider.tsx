import type { StandardDisconnectFeature, StandardDisconnectMethod } from '@wallet-standard/features';
import { getFeatureGuardFunction, StandardDisconnect } from '@wallet-standard/features';
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
export const hasDisconnectFeature: ReturnType<
    typeof getFeatureGuardFunction<StandardDisconnectFeature, typeof StandardDisconnect>
> = /*#__PURE__*/ getFeatureGuardFunction(StandardDisconnect);

/** TODO: docs */
export const DisconnectProvider: FC<DisconnectProviderProps> = ({ children, onError }) => {
    const wallet = useWallet();

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
    const promise = useRef<ReturnType<StandardDisconnectMethod>>();
    const disconnect = useMemo<StandardDisconnectMethod | undefined>(
        () =>
            hasDisconnectFeature(wallet)
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
                          promise.current = wallet.features[StandardDisconnect].disconnect();
                          return await promise.current;
                      } catch (error: any) {
                          throw handleError(error);
                      } finally {
                          setWaiting(false);
                          promise.current = undefined;
                      }
                  }
                : undefined,
        [handleError, wallet]
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
