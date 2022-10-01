import type { SignTransactionFeature, SignTransactionMethod } from '@wallet-standard/features';
import type { IdentifierRecord } from '@wallet-standard/standard';
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
export function hasSignTransactionFeature(features: IdentifierRecord<unknown>): features is SignTransactionFeature {
    return 'standard:signTransaction' in features;
}

/** TODO: docs */
export const SignTransactionProvider: FC<SignTransactionProviderProps> = ({ children, onError }) => {
    const { features } = useWallet();

    // Handle errors, logging them by default.
    const handleError = useCallback(
        (error: Error) => {
            (onError || console.error)(error);
            return error;
        },
        [onError]
    );

    // Sign transactions with the wallet.
    const [signing, setSigning] = useState(false);
    const promise = useRef<ReturnType<SignTransactionMethod>>();
    const signTransaction = useMemo<SignTransactionMethod | undefined>(
        () =>
            hasSignTransactionFeature(features)
                ? async (...inputs) => {
                      // If already signing, wait for that promise to resolve.
                      if (promise.current) {
                          try {
                              await promise.current;
                          } catch (error: any) {
                              // Error will already have been handled below.
                          }
                      }

                      setSigning(true);
                      try {
                          promise.current = features['standard:signTransaction'].signTransaction(...inputs);
                          return await promise.current;
                      } catch (error: any) {
                          throw handleError(error);
                      } finally {
                          setSigning(false);
                          promise.current = undefined;
                      }
                  }
                : undefined,
        [features, promise, handleError]
    );

    return (
        <SignTransactionContext.Provider
            value={{
                signing,
                signTransaction,
            }}
        >
            {children}
        </SignTransactionContext.Provider>
    );
};
