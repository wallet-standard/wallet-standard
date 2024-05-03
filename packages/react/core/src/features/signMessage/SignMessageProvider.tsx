import type { SignMessageFeature, SignMessageMethod } from '@wallet-standard/experimental-features';
import { getFeatureGuardFunction } from '@wallet-standard/features';
import type { FC, ReactNode } from 'react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useWallet } from '../../useWallet.js';
import { SignMessageContext } from './useSignMessage.js';

/** TODO: docs */
export interface SignMessageProviderProps {
    children: NonNullable<ReactNode>;
    onError?: (error: Error) => void;
}

/** TODO: docs */
const SignMessage = 'experimental:signMessage' as const;
export const hasSignMessageFeature: ReturnType<typeof getFeatureGuardFunction<SignMessageFeature, typeof SignMessage>> =
    /*#__PURE__*/ getFeatureGuardFunction(SignMessage);

/** TODO: docs */
export const SignMessageProvider: FC<SignMessageProviderProps> = ({ children, onError }) => {
    const wallet = useWallet();

    // Handle errors, logging them by default.
    const handleError = useCallback(
        (error: Error) => {
            (onError || console.error)(error);
            return error;
        },
        [onError]
    );

    // Sign messages with the wallet.
    const [waiting, setWaiting] = useState(false);
    const promise = useRef<ReturnType<SignMessageMethod>>();
    const signMessage = useMemo<SignMessageMethod | undefined>(
        () =>
            hasSignMessageFeature(wallet)
                ? async (...inputs) => {
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
                          promise.current = wallet.features[SignMessage].signMessage(...inputs);
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
        <SignMessageContext.Provider
            value={{
                waiting,
                signMessage,
            }}
        >
            {children}
        </SignMessageContext.Provider>
    );
};
