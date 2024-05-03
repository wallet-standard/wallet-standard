import type { SignTransactionFeature, SignTransactionMethod } from '@wallet-standard/experimental-features';
import { getFeatureGuardFunction } from '@wallet-standard/features/src/assertions.js';
import type { FC, ReactNode } from 'react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useWallet } from '../../useWallet.js';
import { SignTransactionContext } from './useSignTransaction.js';

/** TODO: docs */
export interface SignTransactionProviderProps {
    children: NonNullable<ReactNode>;
    onError?: (error: Error) => void;
}

/** TODO: docs */
const SignTransaction = 'experimental:signTransaction' as const;
export const hasSignTransactionFeature: ReturnType<
    typeof getFeatureGuardFunction<SignTransactionFeature, typeof SignTransaction>
> = /*#__PURE__*/ getFeatureGuardFunction(SignTransaction);

/** TODO: docs */
export const SignTransactionProvider: FC<SignTransactionProviderProps> = ({ children, onError }) => {
    const wallet = useWallet();

    // Handle errors, logging them by default.
    const handleError = useCallback(
        (error: Error) => {
            (onError || console.error)(error);
            return error;
        },
        [onError]
    );

    // Sign transactions with the wallet.
    const [waiting, setWaiting] = useState(false);
    const promise = useRef<ReturnType<SignTransactionMethod>>();
    const signTransaction = useMemo<SignTransactionMethod | undefined>(
        () =>
            hasSignTransactionFeature(wallet)
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
                          promise.current = wallet.features[SignTransaction].signTransaction(...inputs);
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
        <SignTransactionContext.Provider
            value={{
                waiting,
                signTransaction,
            }}
        >
            {children}
        </SignTransactionContext.Provider>
    );
};
