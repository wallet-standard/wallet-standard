import type { Wallet } from '@wallet-standard/base';
import type {
    SignAndSendTransactionFeature,
    SignAndSendTransactionMethod,
} from '@wallet-standard/experimental-features';
import type { FC, ReactNode } from 'react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useWallet } from '../../useWallet.js';
import { SignAndSendTransactionContext } from './useSignAndSendTransaction.js';

/** TODO: docs */
export interface SignAndSendTransactionProviderProps {
    children: NonNullable<ReactNode>;
    onError?: (error: Error) => void;
}

/** TODO: docs */
export function hasSignAndSendTransactionFeature(
    features: Wallet['features']
): features is SignAndSendTransactionFeature {
    return 'experimental:signAndSendTransaction' in features;
}

/** TODO: docs */
export const SignAndSendTransactionProvider: FC<SignAndSendTransactionProviderProps> = ({ children, onError }) => {
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
    const [waiting, setWaiting] = useState(false);
    const promise = useRef<ReturnType<SignAndSendTransactionMethod>>();
    const signAndSendTransaction = useMemo<SignAndSendTransactionMethod | undefined>(
        () =>
            hasSignAndSendTransactionFeature(features)
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
                          promise.current = features['experimental:signAndSendTransaction'].signAndSendTransaction(
                              ...inputs
                          );
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
        <SignAndSendTransactionContext.Provider
            value={{
                waiting,
                signAndSendTransaction,
            }}
        >
            {children}
        </SignAndSendTransactionContext.Provider>
    );
};
