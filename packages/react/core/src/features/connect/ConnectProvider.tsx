import type { Wallet } from '@wallet-standard/base';
import type { ConnectFeature, ConnectMethod } from '@wallet-standard/features';
import type { FC, ReactNode } from 'react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useWallet } from '../../useWallet.js';
import { ConnectContext } from './useConnect.js';

/** TODO: docs */
export interface ConnectProviderProps {
    children: NonNullable<ReactNode>;
    onError?: (error: Error) => void;
}

/** TODO: docs */
export function hasConnectFeature(features: Wallet['features']): features is ConnectFeature {
    return 'standard:connect' in features;
}

/** TODO: docs */
export const ConnectProvider: FC<ConnectProviderProps> = ({ children, onError }) => {
    const { features } = useWallet();

    // Handle errors, logging them by default.
    const handleError = useCallback(
        (error: Error) => {
            (onError || console.error)(error);
            return error;
        },
        [onError]
    );

    // Connect to the wallet.
    const [waiting, setWaiting] = useState(false);
    const promise = useRef<ReturnType<ConnectMethod>>();
    const connect = useMemo<ConnectMethod | undefined>(
        () =>
            hasConnectFeature(features)
                ? async (input) => {
                      // FIXME: if called first with silent=true, promise.current will be set but waiting will be false

                      // If already waiting, wait for that promise to resolve.
                      if (promise.current) {
                          try {
                              await promise.current;
                          } catch (error: any) {
                              // Error will already have been handled below.
                          }
                      }

                      const { silent } = input || {};
                      if (!silent) {
                          setWaiting(true);
                      }
                      try {
                          promise.current = features['standard:connect'].connect(input);
                          return await promise.current;
                      } catch (error: any) {
                          throw handleError(error);
                      } finally {
                          if (!silent) {
                              setWaiting(false);
                          }
                          promise.current = undefined;
                      }
                  }
                : undefined,
        [features, promise, handleError]
    );

    return (
        <ConnectContext.Provider
            value={{
                waiting,
                connect,
            }}
        >
            {children}
        </ConnectContext.Provider>
    );
};
