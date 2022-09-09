import type { ConnectFeature, ConnectMethod } from '@wallet-standard/features';
import type { IdentifierRecord } from '@wallet-standard/standard';
import type { FC, ReactNode } from 'react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ConnectContext } from './useConnect.js';
import { useWallet } from './useWallet.js';

/** TODO: docs */
export interface WalletProviderProps {
    children: NonNullable<ReactNode>;
    onError?: (error: Error) => void;
}

/** TODO: docs */
export function hasConnectFeature(features: IdentifierRecord<unknown>): features is ConnectFeature {
    return 'standard:connect' in features;
}

/** TODO: docs */
export const ConnectProvider: FC<WalletProviderProps> = ({ children, onError }: WalletProviderProps) => {
    const { features } = useWallet();

    // If the window is closing or reloading, ignore errors.
    const isUnloading = useRef(false);
    useEffect(() => {
        function beforeUnload() {
            isUnloading.current = true;
        }

        window.addEventListener('beforeunload', beforeUnload);
        return () => window.removeEventListener('beforeunload', beforeUnload);
    }, [isUnloading]);

    // Handle errors, logging them by default.
    const handleError = useCallback(
        (error: Error) => {
            // Call onError unless the window is unloading
            if (!isUnloading.current) (onError || console.error)(error);
            return error;
        },
        [isUnloading, onError]
    );

    // Connect to the wallet
    const [connecting, setConnecting] = useState(false);
    const connectPromise = useRef<any>();
    const connect = useMemo<ConnectMethod | undefined>(
        () =>
            hasConnectFeature(features)
                ? async (input) => {
                      // If already connecting, wait for that promise to resolve
                      if (connectPromise.current) {
                          try {
                              await connectPromise.current;
                          } catch (error: any) {
                              // Error will already have been handled below
                          }
                      }

                      const loud = !input?.silent;
                      if (loud) {
                          setConnecting(true);
                      }
                      try {
                          connectPromise.current = features['standard:connect'].connect(input);
                          return await connectPromise.current;
                      } catch (error: any) {
                          throw handleError(error);
                      } finally {
                          if (loud) {
                              setConnecting(false);
                          }
                          connectPromise.current = undefined;
                      }
                  }
                : undefined,
        [features, connectPromise, handleError]
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
