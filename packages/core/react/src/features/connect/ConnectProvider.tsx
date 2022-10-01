import type { ConnectFeature, ConnectMethod } from '@wallet-standard/features';
import type { Wallet } from '@wallet-standard/standard';
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
    const [connecting, setConnecting] = useState(false);
    const promise = useRef<ReturnType<ConnectMethod>>();
    const connect = useMemo<ConnectMethod | undefined>(
        () =>
            hasConnectFeature(features)
                ? async (input) => {
                      // If already connecting, wait for that promise to resolve.
                      if (promise.current) {
                          try {
                              await promise.current;
                          } catch (error: any) {
                              // Error will already have been handled below.
                          }
                      }

                      const loud = !input?.silent;
                      if (loud) {
                          setConnecting(true);
                      }
                      try {
                          promise.current = features['standard:connect'].connect(input);
                          return await promise.current;
                      } catch (error: any) {
                          throw handleError(error);
                      } finally {
                          if (loud) {
                              setConnecting(false);
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
                connecting,
                connect,
            }}
        >
            {children}
        </ConnectContext.Provider>
    );
};
